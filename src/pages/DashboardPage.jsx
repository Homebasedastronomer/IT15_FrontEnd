import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Dashboard from '../components/dashboard/Dashboard'
import Programlist from '../components/Programlist'
import Subjectlist from '../components/Subjectlist'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  addActivityLog,
  getPrograms,
  getSubjects,
  getAttendanceTrend,
  getCourseOptions,
  getCourseDistribution,
  createStudentRecord,
  enrollStudent,
  getEnrollmentOptions,
  getEnrollmentTrend,
  searchStudents,
  getStudentEnrollmentHistory,
  getSectionRecords,
  saveProgramRecord,
  deleteProgramRecord,
} from '../services/backendApi'
import { getCampusWeather, getWeatherByLocation } from '../services/weatherService'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'programs', label: 'Course Offerings' },
  { id: 'subjects', label: 'Subject Offerings' },
  { id: 'students', label: 'Students' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]

const YEAR_LEVEL_ORDER = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const THEME_STORAGE_KEY = 'umroll_theme_mode'

const inferYearLevelFromCode = (subjectCode = '') => {
  const match = String(subjectCode).toUpperCase().match(/(\d)/)
  if (!match) {
    return '1st Year'
  }

  const yearDigit = Number(match[1])
  if (yearDigit <= 1) {
    return '1st Year'
  }
  if (yearDigit === 2) {
    return '2nd Year'
  }
  if (yearDigit === 3) {
    return '3rd Year'
  }

  return '4th Year'
}

function DashboardPage() {
  const navigate = useNavigate()
  const { section } = useParams()

  const getStoredUserEmail = () => {
    const savedUser = localStorage.getItem('enrollment_user')

    if (!savedUser) {
      return 'No email found'
    }

    try {
      const parsed = JSON.parse(savedUser)
      if (typeof parsed === 'string') {
        return parsed
      }

      if (parsed && typeof parsed.email === 'string') {
        return parsed.email
      }
    } catch {
      return savedUser
    }

    return savedUser
  }

  const user = getStoredUserEmail()

  const validSectionIds = useMemo(() => navItems.map((item) => item.id), [])

  const activeSection = validSectionIds.includes(section) ? section : 'dashboard'

  const [programs, setPrograms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [enrollmentTrend, setEnrollmentTrend] = useState([])
  const [courseDistribution, setCourseDistribution] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [sectionRows, setSectionRows] = useState([])
  const [modulesLoading, setModulesLoading] = useState(true)
  const [modulesError, setModulesError] = useState('')
  const [tableLoading, setTableLoading] = useState(false)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')
  const [weatherSearchLoading, setWeatherSearchLoading] = useState(false)
  const [sectionNotice, setSectionNotice] = useState('')
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [creatingStudent, setCreatingStudent] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [reportSearchQuery, setReportSearchQuery] = useState('')
  const [reportCategoryFilter, setReportCategoryFilter] = useState('all')
  const [reportStatusFilter, setReportStatusFilter] = useState('all')
  const [courseOptions, setCourseOptions] = useState([])
  const [enrollmentOptionsLoading, setEnrollmentOptionsLoading] = useState(false)
  const [enrollingStudent, setEnrollingStudent] = useState(false)
  const [enrollmentPreview, setEnrollmentPreview] = useState(null)
  const [studentLookup, setStudentLookup] = useState('')
  const [studentSuggestions, setStudentSuggestions] = useState([])
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false)
  const [studentHistory, setStudentHistory] = useState(null)
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'dark' ? 'dark' : 'light'
  })
  const [enrollmentForm, setEnrollmentForm] = useState({
    student_id: '',
    year_level: '',
    term: '',
  })
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: 'Male',
    birth_date: '',
    department: '',
    course_id: '',
    year_level: '1',
  })

  useEffect(() => {
    const loadModules = async () => {
      try {
        setModulesLoading(true)
        setModulesError('')

        const [programData, subjectData, trendData, distributionData, attendanceData] =
          await Promise.all([
            getPrograms(),
            getSubjects(),
            getEnrollmentTrend(),
            getCourseDistribution(),
            getAttendanceTrend(),
          ])

        setPrograms(programData)
        setSubjects(subjectData)
        setEnrollmentTrend(trendData)
        setCourseDistribution(distributionData)
        setAttendanceTrend(attendanceData)
      } catch {
        setModulesError('Unable to load dashboard data. Please refresh.')
      } finally {
        setModulesLoading(false)
      }
    }

    loadModules()
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    document.body.classList.toggle('theme-dark', themeMode === 'dark')
  }, [themeMode])

  useEffect(() => {
    if (!section || !validSectionIds.includes(section)) {
      navigate('/dashboard/dashboard', { replace: true })
    }
  }, [navigate, section, validSectionIds])

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true)
        setWeatherError('')
        const weatherData = await getCampusWeather()
        setWeather(weatherData)
      } catch {
        setWeatherError('Weather service temporarily unavailable.')
        setWeather({
          temperature: 30,
          feelsLike: 33,
          summary: 'Warm and Partly Cloudy',
          windSpeed: 8,
          rainChance: 25,
        })
      } finally {
        setWeatherLoading(false)
      }
    }

    loadWeather()
  }, [])

  useEffect(() => {
    const tableSections = ['students', 'enrollment', 'reports', 'settings']

    if (!tableSections.includes(activeSection)) {
      return
    }

    const loadRows = async () => {
      try {
        setTableLoading(true)
        setSectionNotice('')
        let rows = await getSectionRecords(activeSection)

        if (activeSection === 'settings') {
          const savedSettings = localStorage.getItem('umroll_settings')
          if (savedSettings) {
            try {
              const parsed = JSON.parse(savedSettings)
              if (Array.isArray(parsed)) {
                rows = parsed
              }
            } catch {
              // Ignore malformed persisted settings and use API/default rows.
            }
          }
        }

        setSectionRows(rows)
      } catch (err) {
        setSectionRows([])
        setSectionNotice(err.message || 'Unable to load records from backend.')
      } finally {
        setTableLoading(false)
      }
    }

    loadRows()
  }, [activeSection])

  useEffect(() => {
    if (activeSection !== 'students') {
      return
    }

    const loadCourseOptions = async () => {
      try {
        const courses = await getCourseOptions()
        setCourseOptions(courses)
        if (courses.length) {
          if (!studentForm.department || !studentForm.course_id) {
            const defaultDepartment = courses[0].department || ''
            const defaultCourse = courses.find((course) => course.department === defaultDepartment) || courses[0]

            setStudentForm((previous) => ({
              ...previous,
              department: previous.department || defaultDepartment,
              course_id: previous.course_id || String(defaultCourse.id),
            }))
          }
        }
      } catch (err) {
        setCourseOptions([])
        setSectionNotice(err.message || 'Unable to load course options.')
      }
    }

    loadCourseOptions()
  }, [activeSection])

  useEffect(() => {
    if (activeSection !== 'enrollment') {
      return
    }

    if (!enrollmentForm.student_id) {
      setEnrollmentPreview(null)
      return
    }

    if (enrollmentForm.student_id.trim().length < 4) {
      setEnrollmentPreview(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setEnrollmentOptionsLoading(true)
        const preview = await getEnrollmentOptions({
          studentId: enrollmentForm.student_id,
        })
        setEnrollmentPreview(preview)
        const selectedYear = preview?.selected?.year_level
        if (selectedYear) {
          setEnrollmentForm((previous) => ({ ...previous, year_level: String(selectedYear) }))
        }
        if (preview?.selected?.term) {
          setEnrollmentForm((previous) => ({ ...previous, term: preview.selected.term }))
        }
        setSectionNotice('')
      } catch (err) {
        setEnrollmentPreview(null)
        setSectionNotice(err.message || 'Unable to load available subjects for enrollment.')
      } finally {
        setEnrollmentOptionsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [
    activeSection,
    enrollmentForm.student_id,
  ])

  useEffect(() => {
    if (activeSection !== 'enrollment') {
      return
    }

    const lookup = studentLookup.trim()
    if (lookup.length < 2) {
      setStudentSuggestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSuggestionLoading(true)
        const results = await searchStudents(lookup)
        setStudentSuggestions(results)
      } catch {
        setStudentSuggestions([])
      } finally {
        setSuggestionLoading(false)
      }
    }, 220)

    return () => clearTimeout(timeoutId)
  }, [activeSection, studentLookup])

  const sectionTitle = useMemo(
    () => navItems.find((item) => item.id === activeSection)?.label || 'Dashboard',
    [activeSection],
  )

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(courseOptions.map((course) => String(course.department || '').trim()).filter(Boolean)),
    ).sort()
  }, [courseOptions])

  const filteredCourseOptions = useMemo(() => {
    if (!studentForm.department) {
      return courseOptions
    }

    return courseOptions.filter((course) => course.department === studentForm.department)
  }, [courseOptions, studentForm.department])

  const reportCategoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(sectionRows.map((row) => String(row.category || '').trim()).filter(Boolean)),
    )
    return categories
  }, [sectionRows])

  const reportStatusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(sectionRows.map((row) => String(row.status || '').trim()).filter(Boolean)),
    )
    return statuses
  }, [sectionRows])

  const logUserActivity = async (action, details) => {
    try {
      addActivityLog({ action, details, owner: user })

      if (activeSection === 'reports') {
        const rows = await getSectionRecords('reports')
        setSectionRows(rows)
      }
    } catch {
      // Logging should never block the user workflow.
    }
  }

  const handleSaveProgram = async (incomingProgram) => {
    const existing = programs.some((program) => program.id === incomingProgram.id)
    const persisted = await saveProgramRecord(incomingProgram)

    setPrograms((previous) => {
      if (existing) {
        return previous.map((program) => (program.id === persisted.id ? persisted : program))
      }

      return [persisted, ...previous]
    })

    const action = existing ? 'Updated Program' : 'Added Program'
    const details = `${persisted.code || 'N/A'} - ${persisted.name || 'Untitled Program'}`
    await logUserActivity(action, details)

    return persisted
  }

  const handleDeleteProgram = async (programId) => {
    const target = programs.find((program) => program.id === programId)
    await deleteProgramRecord(programId)
    setPrograms((previous) => previous.filter((program) => program.id !== programId))

    if (target) {
      await logUserActivity('Deleted Program', `${target.code || 'N/A'} - ${target.name || 'Program'}`)
    }
  }

  const handleSaveSubject = (incomingSubject) => {
    const existing = subjects.some((subject) => subject.id === incomingSubject.id)

    setSubjects((previous) => {
      if (existing) {
        return previous.map((subject) =>
          subject.id === incomingSubject.id ? { ...subject, ...incomingSubject } : subject,
        )
      }

      return [incomingSubject, ...previous]
    })

    const action = existing ? 'Updated Subject' : 'Added Subject'
    const details = `${incomingSubject.code || 'N/A'} - ${incomingSubject.title || 'Untitled Subject'}`
    void logUserActivity(action, details)
  }

  const handleDeleteSubject = (subjectId) => {
    const target = subjects.find((subject) => subject.id === subjectId)
    setSubjects((previous) => previous.filter((subject) => subject.id !== subjectId))

    if (target) {
      void logUserActivity('Deleted Subject', `${target.code || 'N/A'} - ${target.title || 'Subject'}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('enrollment_auth')
    localStorage.removeItem('enrollment_user')
    navigate('/login', { replace: true })
  }

  const handleSelectSection = (sectionId) => {
    navigate(`/dashboard/${sectionId}`)
  }

  const handleSearchWeatherLocation = async (cityName) => {
    try {
      setWeatherSearchLoading(true)
      setWeatherError('')
      const weatherData = await getWeatherByLocation(cityName)
      setWeather(weatherData)
    } catch (err) {
      setWeatherError(err.message || 'Could not find that location.')
    } finally {
      setWeatherSearchLoading(false)
    }
  }

  const exportRowsAsCsv = (rows, fileName) => {
    if (!rows.length) {
      window.alert('No data available to export.')
      return
    }

    const columns = Object.keys(rows[0])
    const escapeCell = (value) => {
      const stringValue = String(value ?? '')
      const escaped = stringValue.replaceAll('"', '""')
      return `"${escaped}"`
    }

    const csv = [
      columns.join(','),
      ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleStudentFormChange = (key, value) => {
    if (key === 'department') {
      const matchingCourses = courseOptions.filter((course) => course.department === value)
      setStudentForm((previous) => ({
        ...previous,
        department: value,
        course_id: matchingCourses[0] ? String(matchingCourses[0].id) : '',
      }))
      return
    }

    setStudentForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleCreateStudent = async (event) => {
    event.preventDefault()

    try {
      setCreatingStudent(true)
      setSectionNotice('')

      const createdStudent = await createStudentRecord({
        ...studentForm,
        department: studentForm.department,
        course_id: Number(studentForm.course_id),
        year_level: Number(studentForm.year_level),
          status: 'Enrolled',
      })

      const rows = await getSectionRecords('students')
      setSectionRows(rows)
      setShowAddStudentForm(false)
      setSectionNotice('Student added successfully.')
      setStudentForm((previous) => ({
        ...previous,
        first_name: '',
        last_name: '',
        email: '',
        birth_date: '',
      }))

      const details = `${createdStudent?.student_number || 'N/A'} - ${createdStudent?.first_name || ''} ${createdStudent?.last_name || ''}`.trim()
      await logUserActivity('Added Student', details)
    } catch (err) {
      setSectionNotice(err.message || 'Failed to add student.')
    } finally {
      setCreatingStudent(false)
    }
  }

  const handleEnrollmentFormChange = (key, value) => {
    setEnrollmentForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleStudentLookupChange = (value) => {
    setStudentLookup(value)

    const normalized = value.trim().toUpperCase()
    if (normalized.startsWith('UM-')) {
      handleEnrollmentFormChange('student_id', normalized)
    }
  }

  const handleSelectSuggestion = (student) => {
    const label = `${student.full_name} (${student.student_id})`
    setStudentLookup(label)
    setStudentSuggestions([])
    setEnrollmentPreview(null)
    setEnrollmentForm((previous) => ({
      ...previous,
      student_id: student.student_id,
      year_level: String(student.year_level || ''),
    }))
  }

  const handleSubmitEnrollment = async (event) => {
    event.preventDefault()

    if (!enrollmentForm.student_id) {
      setSectionNotice('Select a student from suggestions or enter a valid Student ID.')
      return
    }

    try {
      setEnrollingStudent(true)
      const result = await enrollStudent({
        student_id: enrollmentForm.student_id,
      })

      setSectionNotice(result.message || 'Student enrollment updated successfully.')

      const [preview, rows] = await Promise.all([
        getEnrollmentOptions({
          studentId: enrollmentForm.student_id,
        }),
        getSectionRecords('enrollment'),
      ])

      setEnrollmentPreview(preview)
      setSectionRows(rows)

      const details = `${enrollmentForm.student_id} (${preview?.selected?.course?.code || 'N/A'}, ${preview?.selected?.term || preview?.current_term || 'Current Term'})`
      await logUserActivity('Enrolled Student', details)
    } catch (err) {
      setSectionNotice(err.message || 'Failed to update enrollment.')
    } finally {
      setEnrollingStudent(false)
    }
  }

  const handleViewStudentHistory = async (studentId) => {
    try {
      setStudentHistoryLoading(true)
      setSectionNotice('')
      const data = await getStudentEnrollmentHistory(studentId)
      setStudentHistory(data)
    } catch (err) {
      setStudentHistory(null)
      setSectionNotice(err.message || 'Unable to load student history.')
    } finally {
      setStudentHistoryLoading(false)
    }
  }

  const handleCloseStudentHistory = () => {
    setStudentHistory(null)
  }

  const toggleThemeMode = () => {
    setThemeMode((previous) => (previous === 'dark' ? 'light' : 'dark'))
  }

  const displayedRows = useMemo(() => {
    if (activeSection === 'students') {
      const query = studentSearchQuery.trim().toLowerCase()

      if (!query) {
        return sectionRows
      }

      return sectionRows.filter((row) => {
        const name = String(row.full_name || '').toLowerCase()
        const studentId = String(row.student_id || '').toLowerCase()
        return name.includes(query) || studentId.includes(query)
      })
    }

    if (activeSection === 'reports') {
      const query = reportSearchQuery.trim().toLowerCase()

      return sectionRows.filter((row) => {
        const matchesQuery =
          !query ||
          String(row.action || '').toLowerCase().includes(query) ||
            String(row.details || '').toLowerCase().includes(query) ||
            String(row.performed_by || '').toLowerCase().includes(query)

        const matchesCategory =
          reportCategoryFilter === 'all' || String(row.category || '') === reportCategoryFilter

        const matchesStatus =
          reportStatusFilter === 'all' || String(row.status || '') === reportStatusFilter

        return matchesQuery && matchesCategory && matchesStatus
      })
    }

    return sectionRows
  }, [
    activeSection,
    reportCategoryFilter,
    reportSearchQuery,
    reportStatusFilter,
    sectionRows,
    studentSearchQuery,
  ])

  const programsWithComputedYearLevels = useMemo(() => {
    return programs.map((program) => {
      const computedYearLevels = YEAR_LEVEL_ORDER.reduce((accumulator, yearLevel) => {
        accumulator[yearLevel] = []
        return accumulator
      }, {})

      subjects
        .filter((subject) => subject.programCode === program.code)
        .forEach((subject) => {
          const yearLevel = subject.yearLevel || inferYearLevelFromCode(subject.code)
          const normalizedYearLevel = YEAR_LEVEL_ORDER.includes(yearLevel) ? yearLevel : '1st Year'
          computedYearLevels[normalizedYearLevel].push(`${subject.code} - ${subject.title}`)
        })

      return {
        ...program,
        yearLevels: computedYearLevels,
      }
    })
  }, [programs, subjects])

  const sectionActions = useMemo(() => {
    if (activeSection === 'students') {
      return [
        {
          label: 'Add Student',
          onClick: () => setShowAddStudentForm((previous) => !previous),
        },
      ]
    }

    if (activeSection === 'reports') {
      return [
        {
          label: 'Export CSV',
          onClick: () => exportRowsAsCsv(sectionRows, 'reports-export.csv'),
          primary: true,
        },
      ]
    }

    return []
  }, [activeSection, sectionRows])

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      onLogout={handleLogout}
      userEmail={user}
      title={sectionTitle}
      weather={weather}
      weatherLoading={weatherLoading}
    >
      {activeSection === 'dashboard' && modulesLoading && (
        <section className="module-stack" aria-label="Loading dashboard modules">
          <div className="skeleton-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="panel skeleton-card" />
            ))}
          </div>
          <div className="panel skeleton-chart" />
        </section>
      )}

      {activeSection === 'dashboard' && !modulesLoading && modulesError && (
        <section className="panel status-panel">{modulesError}</section>
      )}

      {activeSection === 'dashboard' && !modulesLoading && !modulesError && (
        <Dashboard
          programs={programs}
          subjects={subjects}
          enrollmentTrend={enrollmentTrend}
          courseDistribution={courseDistribution}
          attendanceTrend={attendanceTrend}
          weather={weather}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          onSearchLocation={handleSearchWeatherLocation}
          weatherSearchLoading={weatherSearchLoading}
        />
      )}

      {activeSection === 'programs' && (
        <Programlist
          programs={programsWithComputedYearLevels}
          onSaveProgram={handleSaveProgram}
          onDeleteProgram={handleDeleteProgram}
        />
      )}

      {activeSection === 'subjects' && (
        <Subjectlist
          subjects={subjects}
          programs={programs}
          onSaveSubject={handleSaveSubject}
          onDeleteSubject={handleDeleteSubject}
        />
      )}

      {['students', 'enrollment', 'reports', 'settings'].includes(activeSection) && (
        <section className="panel records-panel">
          <div className="records-header">
            <div className="panel-header">
              <h3>{sectionTitle}</h3>
            </div>
            <div className="records-actions">
              {sectionActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={`records-action-btn ${action.primary ? 'primary' : ''}`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <div className="records-table-wrap">
            {sectionNotice ? <p className="status-text">{sectionNotice}</p> : null}

            {activeSection === 'students' ? (
              <div className="records-search-row">
                <input
                  type="text"
                  className="records-search-input"
                  placeholder="Search student by name or ID"
                  value={studentSearchQuery}
                  onChange={(event) => setStudentSearchQuery(event.target.value)}
                />
                <span className="records-search-meta">{displayedRows.length} result(s)</span>
              </div>
            ) : null}

            {activeSection === 'reports' ? (
              <div className="reports-filter-row">
                <input
                  type="text"
                  className="records-search-input"
                  placeholder="Search logs by action, details, or user"
                  value={reportSearchQuery}
                  onChange={(event) => setReportSearchQuery(event.target.value)}
                />
                <select
                  className="reports-filter-select"
                  value={reportCategoryFilter}
                  onChange={(event) => setReportCategoryFilter(event.target.value)}
                >
                  <option value="all">All Categories</option>
                  {reportCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="reports-filter-select"
                  value={reportStatusFilter}
                  onChange={(event) => setReportStatusFilter(event.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {reportStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="records-search-meta">{displayedRows.length} result(s)</span>
              </div>
            ) : null}

            {activeSection === 'settings' ? (
              <section className="theme-settings-card" aria-label="Appearance settings">
                <div>
                  <h4>Appearance Theme</h4>
                  <p>
                    Current mode: <strong>{themeMode === 'dark' ? 'Dark' : 'Light'}</strong>
                  </p>
                </div>
                <label className="theme-switch" aria-label="Toggle dark mode">
                  <input
                    type="checkbox"
                    checked={themeMode === 'dark'}
                    onChange={toggleThemeMode}
                  />
                  <span className="theme-switch-track" aria-hidden="true">
                    <span className="theme-switch-knob" />
                  </span>
                  <span className="theme-switch-label">Dark Mode</span>
                </label>
              </section>
            ) : null}

            {activeSection === 'students' && showAddStudentForm ? (
              <form className="inline-student-form" onSubmit={handleCreateStudent}>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={studentForm.first_name}
                  onChange={(event) => handleStudentFormChange('first_name', event.target.value)}
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={studentForm.last_name}
                  onChange={(event) => handleStudentFormChange('last_name', event.target.value)}
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={studentForm.email}
                  onChange={(event) => handleStudentFormChange('email', event.target.value)}
                />
                <select
                  value={studentForm.department}
                  onChange={(event) => handleStudentFormChange('department', event.target.value)}
                  required
                >
                  <option value="">Select department</option>
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <select
                  value={studentForm.course_id}
                  onChange={(event) => handleStudentFormChange('course_id', event.target.value)}
                  required
                >
                  <option value="">Select course/program</option>
                  {filteredCourseOptions.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                <select
                  value={studentForm.year_level}
                  onChange={(event) => handleStudentFormChange('year_level', event.target.value)}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                <button type="submit" disabled={creatingStudent}>
                  {creatingStudent ? 'Adding...' : 'Create Student'}
                </button>
              </form>
            ) : null}

            {activeSection === 'enrollment' ? (
              <form className="inline-enrollment-form" onSubmit={handleSubmitEnrollment}>
                <input
                  type="text"
                  required
                  placeholder="Search by Student ID or Name"
                  value={studentLookup}
                  onChange={(event) => handleStudentLookupChange(event.target.value)}
                />
                <input
                  type="text"
                  value={
                    enrollmentPreview?.selected?.course?.code
                      ? `${enrollmentPreview.selected.course.code} - ${enrollmentPreview.selected.course.name}`
                      : 'Program auto-detected from student'
                  }
                  readOnly
                />
                <input
                  type="text"
                  value={
                    enrollmentPreview?.selected?.year_level
                      ? `${enrollmentPreview.selected.year_level} Year Level`
                      : 'Year level auto-detected from student'
                  }
                  readOnly
                />
                <input
                  type="text"
                  value={enrollmentPreview?.current_term || 'Current semester auto-detected by date'}
                  readOnly
                />
                <button type="submit" disabled={enrollingStudent}>
                  {enrollingStudent ? 'Saving Enrollment...' : 'Enroll Student'}
                </button>
              </form>
            ) : null}

            {activeSection === 'enrollment' && (studentSuggestions.length > 0 || suggestionLoading) ? (
              <div className="student-suggestion-box" role="listbox" aria-label="Student suggestions">
                {suggestionLoading ? <p>Searching students...</p> : null}
                {!suggestionLoading &&
                  studentSuggestions.map((student) => (
                    <button
                      key={student.student_id}
                      type="button"
                      className="student-suggestion-item"
                      onClick={() => handleSelectSuggestion(student)}
                    >
                      <strong>{student.full_name}</strong>
                      <span>
                        {student.student_id} | {student.program?.code || 'N/A'} | Year{' '}
                        {student.year_level || 'N/A'}
                      </span>
                    </button>
                  ))}
              </div>
            ) : null}

            {activeSection === 'enrollment' && enrollmentPreview ? (
              <section className="enrollment-availability-panel" aria-label="Available subjects">
                <div className="enrollment-availability-header">
                  <h4>
                    Available Subjects for {enrollmentPreview.selected?.label || 'Current Year'}
                  </h4>
                  <p>
                    Student: {enrollmentPreview.student?.student_number} -{' '}
                    {enrollmentPreview.student?.full_name}
                  </p>
                </div>

                {enrollmentOptionsLoading ? (
                  <p className="status-text">Loading available subjects...</p>
                ) : (
                  <article className="enrollment-year-card">
                    <h5>
                      {enrollmentPreview.selected?.label || 'Current Year'} |{' '}
                      {enrollmentPreview.selected?.term || enrollmentPreview.current_term}
                    </h5>
                    {(enrollmentPreview.available_for_selected_year || []).length ? (
                      <ul>
                        {(enrollmentPreview.available_for_selected_year || []).map((subject) => (
                          <li key={subject.id}>
                            <strong>{subject.code}</strong>
                            <span>{subject.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No subjects offered for the student's current year in this term.</p>
                    )}
                  </article>
                )}
              </section>
            ) : null}

            {tableLoading ? <p className="status-text">Loading records...</p> : null}
            <table className="records-table">
              <thead>
                <tr>
                  {sectionRows[0] &&
                    Object.keys(sectionRows[0]).map((col) => (
                      <th key={col}>{col.replaceAll('_', ' ')}</th>
                    ))}
                  {activeSection === 'students' ? <th>actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, rowIndex) => (
                  <tr key={`${activeSection}-${rowIndex}`}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key}>
                        {activeSection === 'settings' && key === 'value' ? (
                          <input
                            className="settings-inline-input"
                            value={value}
                            onChange={(event) => {
                              const next = [...sectionRows]
                              next[rowIndex] = { ...next[rowIndex], value: event.target.value }
                              setSectionRows(next)
                            }}
                          />
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                    {activeSection === 'students' ? (
                      <td>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={() => handleViewStudentHistory(row.student_id)}
                          disabled={studentHistoryLoading}
                        >
                          {studentHistoryLoading ? 'Loading...' : 'Details'}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {studentHistory ? (
        <div className="modal-backdrop" role="presentation" onClick={handleCloseStudentHistory}>
          <section
            className="modal-card panel student-history-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Student enrollment history"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="records-header">
              <div className="panel-header">
                <h3>Enrollment History</h3>
                <p>
                  {studentHistory.student?.student_number} - {studentHistory.student?.full_name}
                </p>
                <p>
                  Program: {studentHistory.program?.code} - {studentHistory.program?.name}
                </p>
              </div>
              <div className="records-actions">
                <button type="button" className="records-action-btn" onClick={handleCloseStudentHistory}>
                  Close
                </button>
              </div>
            </div>

            <div className="student-history-grid">
              {(studentHistory.history || []).map((year) => (
                <article key={year.year_level} className="student-history-year-card">
                  <h4>
                    {year.label}
                    {year.is_current ? ' (Current)' : ''}
                  </h4>
                  <p>
                    Subjects: {year.total_subjects} | Units: {year.total_units}
                  </p>

                  {(year.terms || []).map((termBlock) => (
                    <div key={termBlock.term} className="student-history-term-block">
                      <h5>{termBlock.term}</h5>
                      {termBlock.subjects.length ? (
                        <ul>
                          {termBlock.subjects.map((subject) => (
                            <li key={subject.id}>
                              <strong>{subject.code}</strong> {subject.title}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No enrolled subjects in this term.</p>
                      )}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default DashboardPage