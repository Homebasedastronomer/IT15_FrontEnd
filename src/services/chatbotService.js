import {
  getActivityLogs,
  getEnrollmentOptions,
  getSectionRecords,
  getStudentEnrollmentHistory,
  searchStudents,
} from './backendApi'

const includesAny = (message, terms) => terms.some((term) => message.includes(term))

const toNumber = (value) => Number(value || 0)

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value || 0)))

const toYearLabel = (yearLevel) => {
  const level = Number(yearLevel)
  if (level === 1) return '1st Year'
  if (level === 2) return '2nd Year'
  if (level === 3) return '3rd Year'
  if (level === 4) return '4th Year'
  return `${level || 1}th Year`
}

const getCurrentAcademicTerm = () => {
  const month = new Date().getMonth() + 1

  if (month >= 8 && month <= 12) {
    return '1st Semester'
  }

  if (month >= 1 && month <= 5) {
    return '2nd Semester'
  }

  return 'Summer Term'
}

const extractStudentQuery = (normalizedMessage) => {
  const idMatch = normalizedMessage.match(/\bum-\d{3,}\b/i)
  if (idMatch) {
    return idMatch[0].toUpperCase()
  }

  const namedMatch = normalizedMessage.match(
    /(?:student|history|find|search|lookup)\s+(?:for\s+|of\s+)?([a-z][a-z\s]{1,40})$/i,
  )

  if (!namedMatch?.[1]) {
    return ''
  }

  return namedMatch[1].trim()
}

const summarizeSubjectTerms = (subjects) => {
  const buckets = subjects.reduce((accumulator, subject) => {
    const term = String(subject.offeredIn || subject.offered_in || 'Unspecified')
    accumulator[term] = (accumulator[term] || 0) + 1
    return accumulator
  }, {})

  const entries = Object.entries(buckets)
    .sort((left, right) => right[1] - left[1])
    .map(([term, count]) => `${term}: ${count}`)

  if (!entries.length) {
    return 'No subject term distribution is available.'
  }

  return `Subjects by term: ${entries.join(' | ')}`
}

const summarizeEnrollmentOptions = (preview, studentId) => {
  const student = preview?.student
  const selected = preview?.selected
  const term = selected?.term || preview?.current_term || 'Current Term'
  const subjects = Array.isArray(preview?.available_for_selected_year)
    ? preview.available_for_selected_year
    : []

  const header = [
    `${student?.full_name || studentId} (${student?.student_number || studentId})`,
    `Program: ${selected?.course?.code || 'N/A'} | ${selected?.label || 'Current Year'} | ${term}`,
  ]

  if (!subjects.length) {
    return [...header, 'No available subjects were returned for the selected year and term.'].join('\n')
  }

  const sample = subjects.slice(0, 8).map((subject, index) => `${index + 1}. ${subject.code} - ${subject.title}`)
  const extra = subjects.length > 8 ? `...and ${subjects.length - 8} more.` : ''

  return [...header, `Available subjects: ${subjects.length}`, ...sample, extra].filter(Boolean).join('\n')
}

const formatCapabilities = () => [
  'You can ask me these in your system:',
  '1. Student totals: "total students", "how many students"',
  '2. Program totals: "total programs", "active programs", "inactive programs"',
  '3. Subject totals: "total subjects", "subjects per term", "subjects with prerequisites"',
  '4. Attendance metrics: "average attendance", "highest attendance", "lowest attendance", "today attendance"',
  '5. Enrollment trends: "enrollment trend", "latest enrollment", "best month enrollment"',
  '6. Distribution: "top course distribution", "largest program", "smallest program"',
  '7. Student search: "find student UM-0001", "search student maria"',
  '8. Student history: "history UM-0001", "enrollment history of maria"',
  '9. Enrollment options: "available subjects for UM-0001", "what can UM-0001 enroll"',
  '10. Reports/logs: "latest activity logs", "how many logs", "latest action"',
  '11. Weather: "weather now", "rain chance", "wind speed", "forecast tomorrow"',
  `12. Academic term: "current term", "what semester is this" (${getCurrentAcademicTerm()})`,
  '13. Help menu: "what can i ask", "show all questions", "commands"',
].join('\n')

export async function askEnrollmentBot(message, context = {}) {
  await new Promise((resolve) => setTimeout(resolve, 650))

  const normalizedMessage = String(message || '').toLowerCase().trim()

  if (!normalizedMessage) {
    return 'Type a question and I will help with dashboard stats, student lookup, enrollment history, and logs.'
  }

  if (includesAny(normalizedMessage, ['help', 'what can i ask', 'capabilities', 'commands'])) {
    return formatCapabilities()
  }

  const programs = Array.isArray(context.programs) ? context.programs : []
  const subjects = Array.isArray(context.subjects) ? context.subjects : []
  const enrollmentTrend = Array.isArray(context.enrollmentTrend) ? context.enrollmentTrend : []
  const courseDistribution = Array.isArray(context.courseDistribution) ? context.courseDistribution : []
  const attendanceTrend = Array.isArray(context.attendanceTrend) ? context.attendanceTrend : []
  const weather = context.weather && typeof context.weather === 'object' ? context.weather : null

  if (includesAny(normalizedMessage, ['hello', 'hi', 'hey'])) {
    return 'Hi. Ask "what can i ask" to see every supported question.'
  }

  if (includesAny(normalizedMessage, ['all questions', 'show all', 'everything i can ask', 'anything i can ask'])) {
    return formatCapabilities()
  }

  if (includesAny(normalizedMessage, ['current term', 'what semester', 'what term'])) {
    return `The current academic term is ${getCurrentAcademicTerm()}.`
  }

  if (includesAny(normalizedMessage, ['total students', 'how many students', 'student count'])) {
    try {
      const students = await getSectionRecords('students')
      return `There are ${students.length} total enrolled students in the system.`
    } catch {
      const estimated = courseDistribution.reduce((sum, item) => sum + toNumber(item.students), 0)
      if (estimated > 0) {
        return `Student table is unavailable right now. Estimated total from course distribution is ${estimated}.`
      }
      return 'I cannot fetch total students right now.'
    }
  }

  if (includesAny(normalizedMessage, ['total programs', 'how many program', 'program count'])) {
    const active = programs.filter((program) => String(program.status || '').toLowerCase() === 'active').length
    return `There are ${programs.length} total programs, with ${active} marked active.`
  }

  if (includesAny(normalizedMessage, ['active programs', 'inactive programs', 'program status'])) {
    const active = programs.filter((program) => String(program.status || '').toLowerCase() === 'active').length
    const inactive = Math.max(0, programs.length - active)
    const rate = programs.length ? Math.round((active / programs.length) * 100) : 0
    return `Program status: ${active} active, ${inactive} inactive (${rate}% active).`
  }

  if (includesAny(normalizedMessage, ['total subjects', 'how many subject', 'subject count'])) {
    return `There are ${subjects.length} total subjects in the current dataset.`
  }

  if (includesAny(normalizedMessage, ['subjects per term', 'subject term', 'offered in'])) {
    return summarizeSubjectTerms(subjects)
  }

  if (includesAny(normalizedMessage, ['prerequisite', 'pre-req', 'with prerequisites'])) {
    const withPrereq = subjects.filter((subject) => Array.isArray(subject.prerequisites) && subject.prerequisites.length > 0).length
    return `${withPrereq} subjects currently have prerequisites.`
  }

  if (includesAny(normalizedMessage, ['attendance average', 'average attendance', 'attendance rate'])) {
    if (!attendanceTrend.length) {
      return 'Attendance trend data is currently empty.'
    }

    const values = attendanceTrend.map((item) => toNumber(item.attendance)).filter((value) => value > 0)
    if (!values.length) {
      return 'Attendance trend values are present but currently zero.'
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    return `Average attendance is ${average.toFixed(1)}% across ${values.length} recorded school days.`
  }

  if (includesAny(normalizedMessage, ['highest attendance', 'max attendance', 'best attendance'])) {
    if (!attendanceTrend.length) {
      return 'Attendance trend data is currently empty.'
    }

    const best = [...attendanceTrend]
      .map((item) => ({
        date: item.label || item.date,
        attendance: clampPercent(item.attendance),
      }))
      .sort((left, right) => right.attendance - left.attendance)[0]

    return `Highest attendance is ${best.attendance.toFixed(1)}% on ${best.date || 'a recorded day'}.`
  }

  if (includesAny(normalizedMessage, ['lowest attendance', 'min attendance', 'worst attendance'])) {
    if (!attendanceTrend.length) {
      return 'Attendance trend data is currently empty.'
    }

    const worst = [...attendanceTrend]
      .map((item) => ({
        date: item.label || item.date,
        attendance: clampPercent(item.attendance),
      }))
      .sort((left, right) => left.attendance - right.attendance)[0]

    return `Lowest attendance is ${worst.attendance.toFixed(1)}% on ${worst.date || 'a recorded day'}.`
  }

  if (includesAny(normalizedMessage, ['today attendance', 'attendance today'])) {
    if (!attendanceTrend.length) {
      return 'Attendance trend data is currently empty.'
    }

    const latest = attendanceTrend[attendanceTrend.length - 1]
    return `Latest recorded attendance is ${clampPercent(latest?.attendance).toFixed(1)}% on ${latest?.label || latest?.date || 'the latest school day'}.`
  }

  if (includesAny(normalizedMessage, ['top course', 'course distribution', 'most students', 'largest program'])) {
    if (!courseDistribution.length) {
      return 'Course distribution is not available yet.'
    }

    const sorted = [...courseDistribution]
      .map((entry) => ({
        course: entry.short || entry.course || 'N/A',
        students: toNumber(entry.students),
      }))
      .sort((left, right) => right.students - left.students)
      .slice(0, 3)

    const lines = sorted.map((entry, index) => `${index + 1}. ${entry.course}: ${entry.students} students`)
    return ['Top programs by students:', ...lines].join('\n')
  }

  if (includesAny(normalizedMessage, ['smallest program', 'lowest program', 'least students'])) {
    if (!courseDistribution.length) {
      return 'Course distribution is not available yet.'
    }

    const sorted = [...courseDistribution]
      .map((entry) => ({
        course: entry.short || entry.course || 'N/A',
        students: toNumber(entry.students),
      }))
      .sort((left, right) => left.students - right.students)
      .slice(0, 3)

    const lines = sorted.map((entry, index) => `${index + 1}. ${entry.course}: ${entry.students} students`)
    return ['Smallest programs by students:', ...lines].join('\n')
  }

  if (includesAny(normalizedMessage, ['enrollment trend', 'enrollment this month', 'monthly enrollment'])) {
    if (!enrollmentTrend.length) {
      return 'Enrollment trend data is currently unavailable.'
    }

    const latest = enrollmentTrend[enrollmentTrend.length - 1]
    const month = latest?.month || 'latest month'
    const enrolled = toNumber(latest?.enrolled)
    const total = enrollmentTrend.reduce((sum, item) => sum + toNumber(item.enrolled), 0)
    return `${month} has ${enrolled} enrolled students. Total shown in the trend window is ${total}.`
  }

  if (includesAny(normalizedMessage, ['best month enrollment', 'highest enrollment month'])) {
    if (!enrollmentTrend.length) {
      return 'Enrollment trend data is currently unavailable.'
    }

    const best = [...enrollmentTrend]
      .map((item) => ({
        month: item.month || 'Unknown',
        enrolled: toNumber(item.enrolled),
      }))
      .sort((left, right) => right.enrolled - left.enrolled)[0]

    return `Highest enrollment month in the current trend window is ${best.month} with ${best.enrolled} students.`
  }

  if (includesAny(normalizedMessage, ['report', 'logs', 'activity', 'audit'])) {
    const logs = getActivityLogs().slice(0, 5)

    if (!logs.length) {
      return 'No activity logs found yet.'
    }

    const lines = logs.map((entry, index) => {
      const date = new Date(entry.generated)
      const stamp = Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString('en-US')
      return `${index + 1}. ${entry.action} - ${entry.details || 'No details'} (${stamp})`
    })

    return ['Latest activity logs:', ...lines].join('\n')
  }

  if (includesAny(normalizedMessage, ['how many logs', 'log count', 'total logs'])) {
    const logs = getActivityLogs()
    return `There are ${logs.length} activity logs stored locally.`
  }

  if (includesAny(normalizedMessage, ['latest action', 'last action'])) {
    const latest = getActivityLogs()[0]
    if (!latest) {
      return 'No activity log entries yet.'
    }
    return `Latest action: ${latest.action} - ${latest.details || 'No details'}.`
  }

  if (includesAny(normalizedMessage, ['history', 'enrollment history'])) {
    const query = extractStudentQuery(normalizedMessage)

    if (!query) {
      return 'Provide a student ID or name, for example: history UM-0001'
    }

    try {
      let studentId = query

      if (!query.startsWith('UM-')) {
        const matches = await searchStudents(query)
        if (!matches.length) {
          return `No student matched "${query}".`
        }
        studentId = String(matches[0].student_id || '').toUpperCase()
      }

      const historyData = await getStudentEnrollmentHistory(studentId)
      const years = Array.isArray(historyData?.history) ? historyData.history : []
      const subjectCount = years.reduce((sum, year) => sum + toNumber(year.total_subjects), 0)
      const units = years.reduce((sum, year) => sum + toNumber(year.total_units), 0)
      const studentName = historyData?.student?.full_name || studentId
      const program = historyData?.program?.code || 'N/A'
      const currentYear = toYearLabel(historyData?.student?.year_level)
      const term = historyData?.current_term || getCurrentAcademicTerm()

      return [
        `${studentName} (${studentId})`,
        `Program: ${program} | Year: ${currentYear} | Current term: ${term}`,
        `History summary: ${subjectCount} subjects, ${units} total units (past + current only).`,
      ].join('\n')
    } catch (error) {
      return error?.message || 'Unable to load enrollment history right now.'
    }
  }

  if (includesAny(normalizedMessage, ['available subjects', 'can enroll', 'enrollment options'])) {
    const query = extractStudentQuery(normalizedMessage)

    if (!query) {
      return 'Provide a student ID or name, for example: available subjects for UM-0001'
    }

    try {
      let studentId = query

      if (!query.startsWith('UM-')) {
        const matches = await searchStudents(query)
        if (!matches.length) {
          return `No student matched "${query}".`
        }
        studentId = String(matches[0].student_id || '').toUpperCase()
      }

      const preview = await getEnrollmentOptions({ studentId })
      return summarizeEnrollmentOptions(preview, studentId)
    } catch (error) {
      return error?.message || 'Unable to load enrollment options right now.'
    }
  }

  if (includesAny(normalizedMessage, ['find student', 'search student', 'lookup student', 'student id'])) {
    const query = extractStudentQuery(normalizedMessage)
    if (!query) {
      return 'Provide an ID or name, for example: find student UM-0001 or search student maria.'
    }

    try {
      const matches = await searchStudents(query)
      if (!matches.length) {
        return `No student matched "${query}".`
      }

      const lines = matches.slice(0, 5).map((student, index) => {
        const programCode = student.program?.code || 'N/A'
        return `${index + 1}. ${student.full_name} (${student.student_id}) - ${programCode}, Year ${student.year_level}`
      })

      return ['Matched students:', ...lines].join('\n')
    } catch (error) {
      return error?.message || 'Student search is currently unavailable.'
    }
  }

  if (includesAny(normalizedMessage, ['weather', 'temperature', 'rain chance', 'wind speed', 'forecast'])) {
    if (!weather) {
      return 'Weather data is not loaded right now.'
    }

    if (includesAny(normalizedMessage, ['forecast tomorrow', 'tomorrow'])) {
      const tomorrow = weather.forecast?.[1]
      if (!tomorrow) {
        return 'Tomorrow forecast is not available yet.'
      }

      return `Tomorrow forecast for ${weather.location || 'Campus'}: ${tomorrow.summary}, high ${Math.round(toNumber(tomorrow.high))}C, low ${Math.round(toNumber(tomorrow.low))}C, rain chance ${toNumber(tomorrow.rainChance)}%.`
    }

    return `${weather.location || 'Campus'} weather now: ${weather.summary}, ${Math.round(toNumber(weather.temperature))}C (feels like ${Math.round(toNumber(weather.feelsLike))}C), wind ${toNumber(weather.windSpeed)} km/h, rain chance ${toNumber(weather.rainChance)}%.`
  }

  return [
    'I can answer from your live dashboard data and records.',
    'Type "what can i ask" to see the complete list of supported questions.',
  ].join('\n')
}