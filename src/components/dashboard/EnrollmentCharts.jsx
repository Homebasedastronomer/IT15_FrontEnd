import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

function EnrollmentCharts({ enrollmentTrend, courseDistribution }) {
  return (
    <section className="charts-grid">
      <article className="panel chart-panel">
        <div className="panel-header">
          <h3>Enrollment Trend</h3>
          <p>Monthly registration activity</p>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 151, 194, 0.2)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="enrolled"
                stroke="#4f8cff"
                strokeWidth={3}
                activeDot={{ r: 7 }}
              />
              <Line type="monotone" dataKey="target" stroke="#46d6a9" strokeWidth={2} />
            </LineChart>
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
    </section>
  )
}

export default EnrollmentCharts