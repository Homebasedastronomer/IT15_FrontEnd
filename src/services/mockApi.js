const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))

const API_BASE = import.meta.env.VITE_API_URL

async function getJson(path) {
  if (!API_BASE) {
    throw new Error('API base URL not configured')
  }

  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json()
}

const dashboardOverview = [
  { key: 'students', label: 'Total Students', value: '4,286', delta: '+6.2%', icon: '👩‍🎓' },
  { key: 'courses', label: 'Courses Offered', value: '162', delta: '+1.3%', icon: '📚' },
  { key: 'enrollment', label: 'Pending Enrollment', value: '312', delta: '-2.8%', icon: '📝' },
  { key: 'completion', label: 'Completion Rate', value: '97%', delta: '+4.1%', icon: '✅' },
]

const enrollmentTrend = [
  { month: 'Jan', enrolled: 380, target: 360 },
  { month: 'Feb', enrolled: 412, target: 390 },
  { month: 'Mar', enrolled: 450, target: 420 },
  { month: 'Apr', enrolled: 468, target: 450 },
  { month: 'May', enrolled: 491, target: 470 },
  { month: 'Jun', enrolled: 524, target: 500 },
  { month: 'Jul', enrolled: 540, target: 520 },
]

const courseDistribution = [
  { course: 'BS Information Technology', short: 'BSIT', students: 980 },
  { course: 'BS Computer Science', short: 'BSCS', students: 860 },
  { course: 'BS Information Systems', short: 'BSIS', students: 720 },
  { course: 'BS Business Administration', short: 'BSBA', students: 960 },
  { course: 'BA Communication', short: 'BACOMM', students: 766 },
]

const sectionData = {
  students: [
    { student_id: 'S-2401', full_name: 'Ariana Cruz', program: 'BSIT', year: '3rd', status: 'Enrolled' },
    { student_id: 'S-2402', full_name: 'Liam Torres', program: 'BSCS', year: '2nd', status: 'Pending' },
    { student_id: 'S-2403', full_name: 'Noah Ramos', program: 'BSBA', year: '1st', status: 'Enrolled' },
    { student_id: 'S-2404', full_name: 'Mia Santos', program: 'BSIS', year: '4th', status: 'Advised' },
  ],
  courses: [
    { code: 'IT-331', title: 'Web Systems and Technologies', units: 3, slots: 45, occupied: 42 },
    { code: 'CS-305', title: 'Data Structures and Algorithms', units: 3, slots: 40, occupied: 39 },
    { code: 'IS-210', title: 'Database Management', units: 3, slots: 45, occupied: 43 },
    { code: 'BA-115', title: 'Operations Management', units: 3, slots: 50, occupied: 45 },
  ],
  enrollment: [
    { batch: '1st Semester 2026', submitted: 4021, approved: 3902, pending: 119 },
    { batch: 'Summer 2026', submitted: 1234, approved: 1178, pending: 56 },
    { batch: '2nd Semester 2026', submitted: 4286, approved: 3974, pending: 312 },
  ],
  reports: [
    { report: 'Program Demand Analysis', owner: 'Analytics Unit', generated: '2026-02-16', status: 'Published' },
    { report: 'Section Utilization Summary', owner: 'Registrar', generated: '2026-02-14', status: 'Published' },
    { report: 'At-Risk Student List', owner: 'Guidance Office', generated: '2026-02-10', status: 'Draft' },
  ],
  settings: [
    { setting: 'Enrollment Window', value: 'Open', last_updated: '2026-02-18 09:00' },
    { setting: 'Default Approval Workflow', value: 'Chairperson + Registrar', last_updated: '2026-02-17 13:20' },
    { setting: 'Notification Channel', value: 'Email + In-app', last_updated: '2026-02-16 11:45' },
  ],
}

export async function getDashboardOverview() {
  await wait()
  return dashboardOverview
}

export async function getEnrollmentTrend() {
  await wait()

  try {
    return await getJson('/dashboard/enrollment-trend')
  } catch {
    return enrollmentTrend
  }
}

export async function getCourseDistribution() {
  await wait()

  try {
    return await getJson('/dashboard/course-distribution')
  } catch {
    return courseDistribution
  }
}

export async function getAttendanceTrend() {
  await wait()

  try {
    return await getJson('/dashboard/attendance-trend')
  } catch {
    const sample = Array.from({ length: 12 }, (_, index) => ({
      date: `Day ${index + 1}`,
      attendance: 82 + Math.round(Math.sin(index / 2) * 8) + (index % 3),
    }))

    return sample
  }
}

export async function getSectionRecords(section) {
  await wait(280)

  if (section === 'students') {
    try {
      const students = await getJson('/students')

      return students.slice(0, 120).map((student) => ({
        student_id: student.student_number,
        full_name: `${student.first_name} ${student.last_name}`,
        program: student.course?.code || 'N/A',
        year: `${student.year_level}${student.year_level === 1 ? 'st' : student.year_level === 2 ? 'nd' : student.year_level === 3 ? 'rd' : 'th'}`,
        status: student.status,
      }))
    } catch {
      return sectionData.students
    }
  }

  if (section === 'enrollment') {
    try {
      const trend = await getJson('/dashboard/enrollment-trend')
      return trend.map((item) => ({
        batch: `${item.month} Enrollment`,
        submitted: item.enrolled,
        approved: Math.max(0, item.enrolled - Math.round(item.enrolled * 0.08)),
        pending: Math.round(item.enrolled * 0.08),
      }))
    } catch {
      return sectionData.enrollment
    }
  }

  if (section === 'reports') {
    try {
      const schoolDays = await getJson('/school-days')
      return schoolDays.slice(0, 8).map((day) => ({
        report: day.event_name || 'Daily Attendance Snapshot',
        owner: 'Registrar Analytics',
        generated: day.school_date,
        status: day.is_holiday ? 'No Classes' : 'Published',
      }))
    } catch {
      return sectionData.reports
    }
  }

  return sectionData[section] || []
}