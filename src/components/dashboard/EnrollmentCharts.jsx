import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const pieColors = ['#4f8cff', '#46d6a9', '#f9b572', '#ad7bff', '#ff7da6']

function CourseDistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="chart-tooltip-card">
      <p>{point.course}</p>
      <strong>{point.students} students</strong>
      <span>{point.share}% of total</span>
    </div>
  )
}

function EnrollmentCharts({ enrollmentTrend, courseDistribution, attendanceTrend }) {
  const totalStudents = courseDistribution.reduce(
    (accumulator, item) => accumulator + Number(item.students || 0),
    0,
  )

  const distributionWithShare = courseDistribution
    .map((item) => {
      const students = Number(item.students || 0)
      const share = totalStudents > 0 ? Math.round((students / totalStudents) * 100) : 0
      return {
        ...item,
        students,
        share,
      }
    })
    .sort((a, b) => b.students - a.students)

  return (
    <section className="charts-grid">
      <article className="panel chart-panel">
        <div className="panel-header">
          <h3>Monthly Enrollment Trend</h3>
          <p>Bar chart of monthly enrollments</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 151, 194, 0.2)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrolled" radius={[8, 8, 0, 0]} fill="#4f8cff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel chart-panel">
        <div className="panel-header">
          <h3>Course Distribution</h3>
          <p>{totalStudents} total students across all programs</p>
        </div>
        <div className="chart-wrap chart-split">
          <ResponsiveContainer width="56%" height={250}>
            <PieChart>
              <Pie
                data={distributionWithShare}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="students"
                nameKey="short"
              >
                {distributionWithShare.map((entry, index) => (
                  <Cell key={entry.course} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CourseDistributionTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <ul className="chart-legend-list" aria-label="Course distribution details">
            {distributionWithShare.map((entry, index) => (
              <li key={entry.course}>
                <span className="legend-name">
                  <span className="legend-dot" style={{ background: pieColors[index % pieColors.length] }} />
                  {entry.short || entry.course}
                </span>
                <div className="legend-metric">
                  <strong>{entry.students}</strong>
                  <span>{entry.share}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article className="panel chart-panel chart-panel-wide">
        <div className="panel-header">
          <h3>Attendance Over School Days</h3>
          <p>Line chart of daily attendance patterns</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 151, 194, 0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={18} />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#46d6a9"
                strokeWidth={2.8}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  )
}

export default EnrollmentCharts