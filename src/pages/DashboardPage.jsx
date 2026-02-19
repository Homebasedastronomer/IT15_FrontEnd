import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatbotPanel from '../components/dashboard/ChatbotPanel'
import EnrollmentCharts from '../components/dashboard/EnrollmentCharts'
import OverviewCards from '../components/dashboard/OverviewCards'
import WeatherWidget from '../components/dashboard/WeatherWidget'
import DashboardLayout from '../layouts/DashboardLayout'
import { askEnrollmentBot } from '../services/chatbotService'
import {
  getCourseDistribution,
  getDashboardOverview,
  getEnrollmentTrend,
  getSectionRecords,
} from '../services/mockApi'
import { getCampusWeather } from '../services/weatherService'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'courses', label: 'Courses' },
  { id: 'enrollment', label: 'Enrollment' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const { section } = useParams()
  const user = localStorage.getItem('enrollment_user') || 'registrar@dollente.edu'
  const validSectionIds = useMemo(() => navItems.map((item) => item.id), [])
  const activeSection = validSectionIds.includes(section) ? section : 'dashboard'

  const [overview, setOverview] = useState([])
  const [enrollmentTrend, setEnrollmentTrend] = useState([])
  const [courseDistribution, setCourseDistribution] = useState([])
  const [sectionRows, setSectionRows] = useState([])
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      const [overviewData, trendData, distributionData] = await Promise.all([
        getDashboardOverview(),
        getEnrollmentTrend(),
        getCourseDistribution(),
      ])

      setOverview(overviewData)
      setEnrollmentTrend(trendData)
      setCourseDistribution(distributionData)
    }

    loadDashboard()
  }, [])

  useEffect(() => {
    if (!section || !validSectionIds.includes(section)) {
      navigate('/dashboard/dashboard', { replace: true })
    }
  }, [navigate, section, validSectionIds])

  useEffect(() => {
    if (activeSection === 'dashboard') {
      setSectionRows([])
      return
    }

    const loadSection = async () => {
      const rows = await getSectionRecords(activeSection)
      setSectionRows(rows)
    }

    loadSection()
  }, [activeSection])

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true)
        const weatherData = await getCampusWeather()
        setWeather(weatherData)
        setWeatherError('')
      } catch {
        setWeatherError('Unable to fetch weather API data. Showing fallback values.')
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

  const sectionTitle = useMemo(
    () => navItems.find((item) => item.id === activeSection)?.label || 'Students',
    [activeSection],
  )

  const handleLogout = () => {
    localStorage.removeItem('enrollment_auth')
    navigate('/login', { replace: true })
  }

  const handleSelectSection = (sectionId) => {
    navigate(`/dashboard/${sectionId}`)
  }

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      onLogout={handleLogout}
      title={`Enrollment Dashboard · ${sectionTitle}`}
      subtitle={`Signed in as ${user}`}
    >
      {activeSection === 'dashboard' ? (
        <>
          <OverviewCards overview={overview} />
          <EnrollmentCharts
            enrollmentTrend={enrollmentTrend}
            courseDistribution={courseDistribution}
          />

          <section className="lower-grid">
            <WeatherWidget weather={weather} loading={weatherLoading} error={weatherError} />
            <ChatbotPanel onAskBot={askEnrollmentBot} />
          </section>
        </>
      ) : (
        <section className="panel records-panel">
          <div className="panel-header">
            <h3>{sectionTitle}</h3>
            <p>Current records loaded from mock service</p>
          </div>
          <div className="records-table-wrap">
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