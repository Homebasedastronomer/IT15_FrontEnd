import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Dashboard from '../components/dashboard/Dashboard'
import Programlist from '../components/Programlist'
import Subjectlist from '../components/Subjectlist'
import DashboardLayout from '../layouts/DashboardLayout'
import {
  getPrograms,
  getSubjects,
  getAttendanceTrend,
  getCourseOptions,
  getCourseDistribution,
  createStudentRecord,
  getEnrollmentTrend,
  getSectionRecords,
} from '../services/backendApi'
import { getCampusWeather, getWeatherByLocation } from '../services/weatherService'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'programs', label: 'Program Offerings' },
  { id: 'subjects', label: 'Subject Offerings' },
  { id: 'students', label: 'Students' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]

const YEAR_LEVEL_ORDER = ['1st Year', '2nd Year', '3rd Year', '4th Year']

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
  const [courseOptions, setCourseOptions] = useState([])
  const [enrollmentPendingOnly, setEnrollmentPendingOnly] = useState(false)
  const [studentForm, setStudentForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: 'Male',
    birth_date: '',
    course_id: '',
    year_level: '1',
    status: 'Enrolled',
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
        if (courses.length && !studentForm.course_id) {
          setStudentForm((previous) => ({ ...previous, course_id: String(courses[0].id) }))
        }
      } catch (err) {
        setCourseOptions([])
        setSectionNotice(err.message || 'Unable to load program options.')
      }
    }

    loadCourseOptions()
  }, [activeSection])

  const sectionTitle = useMemo(
    () => navItems.find((item) => item.id === activeSection)?.label || 'Dashboard',
    [activeSection],
  )

  const handleSaveProgram = (incomingProgram) => {
    setPrograms((previous) => {
      const existing = previous.some((program) => program.id === incomingProgram.id)
      if (existing) {
        return previous.map((program) =>
          program.id === incomingProgram.id ? { ...program, ...incomingProgram } : program,
        )
      }

      return [incomingProgram, ...previous]
    })
  }

  const handleDeleteProgram = (programId) => {
    setPrograms((previous) => previous.filter((program) => program.id !== programId))
  }

  const handleSaveSubject = (incomingSubject) => {
    setSubjects((previous) => {
      const existing = previous.some((subject) => subject.id === incomingSubject.id)
      if (existing) {
        return previous.map((subject) =>
          subject.id === incomingSubject.id ? { ...subject, ...incomingSubject } : subject,
        )
      }

      return [incomingSubject, ...previous]
    })
  }

  const handleDeleteSubject = (subjectId) => {
    setSubjects((previous) => previous.filter((subject) => subject.id !== subjectId))
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

  const saveSettings = () => {
    localStorage.setItem('umroll_settings', JSON.stringify(sectionRows))
    setSectionNotice('Settings saved locally.')
  }

  const handleStudentFormChange = (key, value) => {
    setStudentForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleCreateStudent = async (event) => {
    event.preventDefault()

    try {
      setCreatingStudent(true)
      setSectionNotice('')

      await createStudentRecord({
        ...studentForm,
        course_id: Number(studentForm.course_id),
        year_level: Number(studentForm.year_level),
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
    } catch (err) {
      setSectionNotice(err.message || 'Failed to add student.')
    } finally {
      setCreatingStudent(false)
    }
  }

  const displayedRows = useMemo(() => {
    if (activeSection === 'enrollment' && enrollmentPendingOnly) {
      return sectionRows.filter((row) => Number(row.pending) > 0)
    }

    return sectionRows
  }, [activeSection, enrollmentPendingOnly, sectionRows])

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

    if (activeSection === 'enrollment') {
      return [
        {
          label: enrollmentPendingOnly ? 'Show All Batches' : 'Review Pending',
          onClick: () => setEnrollmentPendingOnly((previous) => !previous),
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

    if (activeSection === 'settings') {
      return [
        {
          label: 'Save Settings',
          onClick: saveSettings,
        },
      ]
    }

    return []
  }, [activeSection, enrollmentPendingOnly, sectionRows])

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
              <p>Current records loaded from backend service</p>
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
                  value={studentForm.course_id}
                  onChange={(event) => handleStudentFormChange('course_id', event.target.value)}
                  required
                >
                  <option value="">Select program</option>
                  {courseOptions.map((course) => (
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
                <select
                  value={studentForm.status}
                  onChange={(event) => handleStudentFormChange('status', event.target.value)}
                >
                  <option value="Enrolled">Enrolled</option>
                  <option value="Pending">Pending</option>
                  <option value="Advised">Advised</option>
                </select>
                <button type="submit" disabled={creatingStudent}>
                  {creatingStudent ? 'Adding...' : 'Create Student'}
                </button>
              </form>
            ) : null}

            {tableLoading ? <p className="status-text">Loading records...</p> : null}
            <table className="records-table">
              <thead>
                <tr>
                  {sectionRows[0] &&
                    Object.keys(sectionRows[0]).map((col) => (
                      <th key={col}>{col.replaceAll('_', ' ')}</th>
                    ))}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default DashboardPage