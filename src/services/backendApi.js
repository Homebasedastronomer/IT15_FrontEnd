import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

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

export async function getSectionRecords(section) {
  if (section === 'students') {
    const data = await getJson('/students')
    const students = toArray(data)

    return students.map((student) => ({
      student_id: student.student_number || student.id || 'N/A',
      full_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A',
      program: student.course?.code || student.program_code || 'N/A',
      year: `${toYearLabel(student.year_level)} Year`,
      status: student.status || 'N/A',
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
    const data = await getJson('/school-days')
    const days = toArray(data)

    return days.map((day) => ({
      report: day.event_name || 'Daily Academic Calendar',
      owner: day.owner || 'Registrar Office',
      generated: day.school_date || day.date || 'N/A',
      status: day.is_holiday ? 'No Classes' : 'Published',
    }))
  }

  if (section === 'settings') {
    return []
  }

  return []
}
