import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL
const ACTIVITY_LOG_STORAGE_KEY = 'umroll_activity_logs'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const toArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  return []
}

const ensureConfigured = () => {
  if (!API_BASE) {
    throw new Error('VITE_API_URL is not configured.')
  }
}

const getJson = async (path) => {
  ensureConfigured()
  const { data } = await api.get(path)
  return data
}

const toYearLabel = (yearLevel) => {
  const level = Number(yearLevel)
  if (level === 1) return '1st'
  if (level === 2) return '2nd'
  if (level === 3) return '3rd'
  if (level === 4) return '4th'
  return String(yearLevel || '')
}

const readActivityLogs = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addActivityLog({ action, details, owner }) {
  const existing = readActivityLogs()
  const now = new Date().toISOString()

  const nextEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    action: String(action || 'User Action'),
    details: String(details || ''),
    owner: String(owner || 'System User'),
    generated: now,
    status: 'Logged',
  }

  const next = [nextEntry, ...existing].slice(0, 300)
  localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(next))
  return nextEntry
}

export function getActivityLogs() {
  return readActivityLogs()
}

export async function getPrograms() {
  const data = await getJson('/programs')
  return toArray(data)
}

export async function getSubjects() {
  const data = await getJson('/subjects')
  return toArray(data)
}

export async function getEnrollmentTrend() {
  const data = await getJson('/dashboard/enrollment-trend')
  return toArray(data)
}

export async function getCourseDistribution() {
  const data = await getJson('/dashboard/course-distribution')
  return toArray(data)
}

export async function getAttendanceTrend() {
  const data = await getJson('/dashboard/attendance-trend')
  return toArray(data)
}

export async function getCourseOptions() {
  const data = await getJson('/courses')
  return toArray(data)
}

export async function createStudentRecord(payload) {
  ensureConfigured()
  const { data } = await api.post('/students', payload)
  return data
}

export async function getEnrollmentOptions({ studentId, term, yearLevel }) {
  ensureConfigured()

  const params = new URLSearchParams()
  params.set('student_id', studentId)

  if (term) {
    params.set('term', term)
  }

  if (yearLevel) {
    params.set('year_level', String(yearLevel))
  }

  const { data } = await api.get(`/enrollment/options?${params.toString()}`)
  return data
}

export async function enrollStudent(payload) {
  ensureConfigured()
  const { data } = await api.post('/enrollment', payload)
  return data
}

export async function getStudentEnrollmentHistory(studentId) {
  ensureConfigured()
  const encoded = encodeURIComponent(String(studentId || '').trim())
  const { data } = await api.get(`/students/${encoded}/enrollment-history`)
  return data
}

export async function searchStudents(query) {
  ensureConfigured()
  const q = String(query || '').trim()
  if (!q) {
    return []
  }
  const encoded = encodeURIComponent(q)
  const { data } = await api.get(`/students/search?q=${encoded}`)
  return toArray(data)
}

export async function getSectionRecords(section) {
  if (section === 'students') {
    const data = await getJson('/students')
    const students = toArray(data)

    return students.map((student) => ({
      student_id: student.student_number || student.id || 'N/A',
      full_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
      department: student.course?.department || 'N/A',
      program: student.course?.code || student.program_code || 'N/A',
      year: `${toYearLabel(student.year_level)} Year`,
      status: 'Enrolled',
    }))
  }

  if (section === 'enrollment') {
    const trend = await getEnrollmentTrend()
    return trend.map((item) => ({
      batch: item.batch || `${item.month || 'Unknown'} Enrollment`,
      submitted: Number(item.submitted ?? item.enrolled ?? 0),
      approved: Number(item.approved ?? item.approved_count ?? 0),
      pending: Number(item.pending ?? item.pending_count ?? 0),
    }))
  }

  if (section === 'reports') {
    const activityLogs = getActivityLogs()

    const activityRows = activityLogs.map((entry) => ({
      category: 'Activity',
      action: entry.action || 'User Action',
      details: entry.details || '-',
      performed_by: entry.owner || 'System User',
      timestamp: entry.generated || 'N/A',
      status: entry.status || 'Logged',
    }))

    return activityRows.sort((left, right) => {
      const leftTime = Date.parse(left.timestamp)
      const rightTime = Date.parse(right.timestamp)

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return 0
      }

      return rightTime - leftTime
    })
  }

  if (section === 'settings') {
    return []
  }

  return []
}
