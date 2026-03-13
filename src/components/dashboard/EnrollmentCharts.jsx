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

function EnrollmentCharts({ enrollmentTrend, courseDistribution, attendanceTrend }) {
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
          <p>Current students per department</p>
        </div>
        <div className="chart-wrap chart-split">
          <ResponsiveContainer width="52%" height={250}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="students"
              >
                {courseDistribution.map((entry, index) => (
                  <Cell key={entry.course} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="48%" height={250}>
            <BarChart data={courseDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 151, 194, 0.2)" />
              <XAxis dataKey="short" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" radius={[8, 8, 0, 0]} fill="#4f8cff" />
            </BarChart>
          </ResponsiveContainer>
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