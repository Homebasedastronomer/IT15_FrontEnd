import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChatbotPanel from './ChatbotPanel'
import EnrollmentCharts from './EnrollmentCharts'
import WeatherWidget from '../weather/WeatherWidget'
import { askEnrollmentBot } from '../../services/chatbotService'

function Dashboard({
  programs,
  subjects,
  enrollmentTrend,
  courseDistribution,
  attendanceTrend,
  weather,
  weatherLoading,
  weatherError,
  onSearchLocation,
  weatherSearchLoading,
}) {
  const activePrograms = programs.filter((program) => program.status === 'Active').length
  const inactivePrograms = programs.length - activePrograms
  const withPrerequisites = subjects.filter((subject) => subject.prerequisites.length > 0).length
  const activeRate = programs.length ? Math.round((activePrograms / programs.length) * 100) : 0
  const termPalette = ['#4f8cff', '#6f6dff', '#46d6a9', '#f9b572', '#ad7bff', '#ff7da6']

  const programStatus = [
    { status: 'Active', total: activePrograms, fill: '#4f8cff' },
    { status: 'Inactive', total: inactivePrograms, fill: '#f9b572' },
  ]

  const subjectsPerTerm = Object.entries(
    subjects.reduce((accumulator, subject) => {
      accumulator[subject.offeredIn] = (accumulator[subject.offeredIn] || 0) + 1
      return accumulator
    }, {}),
  )
    .map(([name, total], index) => ({ name, total, fill: termPalette[index % termPalette.length] }))
    .sort((a, b) => b.total - a.total)

  const recentItems = [
    ...programs.map((program) => ({
      id: `program-${program.id}`,
      label: `${program.code} · ${program.name}`,
      type: 'Program',
      createdAt: program.createdAt,
    })),
    ...subjects.map((subject) => ({
      id: `subject-${subject.id}`,
      label: `${subject.code} · ${subject.title}`,
      type: 'Subject',
      createdAt: subject.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <section className="module-stack">
      <div className="overview-grid">
        <article className="overview-card panel">
          <p className="stat-label">Total Programs</p>
          <h3 className="stat-value">{programs.length}</h3>
        </article>
        <article className="overview-card panel">
          <p className="stat-label">Total Subjects</p>
          <h3 className="stat-value">{subjects.length}</h3>
        </article>
        <article className="overview-card panel">
          <p className="stat-label">Program Activity</p>
          <h3 className="stat-value">
            {activePrograms} Active · {inactivePrograms} Inactive
          </h3>
        </article>
        <article className="overview-card panel">
          <p className="stat-label">With Pre-requisites</p>
          <h3 className="stat-value">{withPrerequisites}</h3>
        </article>
      </div>

      <div className="charts-grid">
        <article className="panel chart-card chart-card-modern">
          <div className="chart-head">
            <div className="panel-header">
              <h3>Program Status Overview</h3>
            </div>
            <div className="chart-badge-group">
              <span className="chart-badge">{activeRate}% Active</span>
              <span className="chart-badge muted">{programs.length} Total Programs</span>
            </div>
          </div>

          <div className="chart-box chart-box-compact">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={programStatus} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="status" width={72} />
                <Tooltip />
                <Bar dataKey="total" radius={[0, 12, 12, 0]}>
                  {programStatus.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-card chart-card-modern">
          <div className="chart-head">
            <div className="panel-header">
              <h3>Subjects per Semester/Term</h3>
            </div>
            <div className="chart-badge-group">
              <span className="chart-badge">{subjects.length} Subjects</span>
              <span className="chart-badge muted">{withPrerequisites} w/ Pre-req</span>
            </div>
          </div>

          <div className="chart-box chart-box-split">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectsPerTerm}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {subjectsPerTerm.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ul className="chart-legend-list">
              {subjectsPerTerm.map((entry) => (
                <li key={entry.name}>
                  <span className="legend-name">
                    <span className="legend-dot" style={{ background: entry.fill }} />
                    {entry.name}
                  </span>
                  <strong>{entry.total}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <EnrollmentCharts
        enrollmentTrend={enrollmentTrend}
        courseDistribution={courseDistribution}
        attendanceTrend={attendanceTrend}
      />

      <section className="lower-grid">
        <article className="panel recent-panel">
          <div className="panel-header">
            <h3>Recently Added Programs or Subjects</h3>
          </div>
          <ul className="recent-list">
            {recentItems.map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <strong>{item.type}</strong>
              </li>
            ))}
          </ul>
        </article>
        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onSearchLocation={onSearchLocation}
          searchLoading={weatherSearchLoading}
        />
        <ChatbotPanel onAskBot={askEnrollmentBot} />
      </section>
    </section>
  )
}

export default Dashboard
