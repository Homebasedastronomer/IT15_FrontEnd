import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import Programlist from '../components/Programlist'
import Subjectlist from '../components/Subjectlist'
import DashboardLayout from '../layouts/DashboardLayout'
import { getPrograms, getSubjects } from '../services/academicData'
import {
  getAttendanceTrend,
  getCourseDistribution,
  getEnrollmentTrend,
  getSectionRecords,
} from '../services/mockApi'
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
        const rows = await getSectionRecords(activeSection)
        setSectionRows(rows)
      } finally {
        setTableLoading(false)
      }
    }

    loadRows()
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

  const sectionActions = useMemo(() => {
    if (activeSection === 'students') {
      return [
        {
          label: 'Add Student',
          onClick: () => window.alert('Add Student form is a design-only action for this prototype.'),
        },
      ]
    }

    if (activeSection === 'enrollment') {
      return [
        {
          label: 'Review Pending',
          onClick: () => window.alert('Pending enrollment review action is available in backend integration.'),
        },
      ]
    }

    if (activeSection === 'reports') {
      return [
        {
          label: 'Generate Report',
          onClick: () => window.alert('Report generation is a design-only action for this prototype.'),
        },
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
          onClick: () => window.alert('Settings save is a design-only action for this prototype.'),
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
          programs={programs}
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
              <p>Current records loaded from mock service</p>
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
                {sectionRows.map((row, rowIndex) => (
                  <tr key={`${activeSection}-${rowIndex}`}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key}>{value}</td>
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