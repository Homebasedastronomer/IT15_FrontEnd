import { useEffect, useMemo, useState } from 'react'
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
const LEGEND_VISIBLE_COURSES = 7

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toDateKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toMonthKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const parseMonthDayLabel = (label) => {
  if (!label) {
    return null
  }

  // Prefer ISO/date-like payloads from backend when available.
  const direct = new Date(label)
  if (!Number.isNaN(direct.getTime())) {
    return {
      month: direct.getMonth(),
      day: direct.getDate(),
      year: direct.getFullYear(),
    }
  }

  const parsed = new Date(`${label} 2000`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return {
    month: parsed.getMonth(),
    day: parsed.getDate(),
    year: null,
  }
}

const getAttendanceLevel = (value) => {
  const attendance = Number(value)
  if (attendance >= 95) return 'high'
  if (attendance >= 85) return 'medium'
  return 'low'
}

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
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState(false)
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState('')
  const today = useMemo(() => new Date(), [])
  const currentMonthKey = useMemo(() => toMonthKey(today), [today])

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

  const legendWithOthers = useMemo(() => {
    if (distributionWithShare.length <= LEGEND_VISIBLE_COURSES) {
      return distributionWithShare
    }

    const primary = distributionWithShare.slice(0, LEGEND_VISIBLE_COURSES)
    const others = distributionWithShare.slice(LEGEND_VISIBLE_COURSES)
    const othersStudents = others.reduce((sum, item) => sum + Number(item.students || 0), 0)
    const othersShare = others.reduce((sum, item) => sum + Number(item.share || 0), 0)

    return [
      ...primary,
      {
        course: 'Others',
        short: 'Others',
        students: othersStudents,
        share: othersShare,
        isOthers: true,
      },
    ]
  }, [distributionWithShare])

  const normalizedAttendance = useMemo(() => {
    const monthDayEntries = (attendanceTrend || [])
      .map((item) => {
        const monthDay = parseMonthDayLabel(item.date)
        if (!monthDay) {
          return null
        }

        return {
          monthDay,
          attendance: Number(item.attendance ?? 0),
          rawLabel: item.date,
        }
      })
      .filter(Boolean)

    if (monthDayEntries.length === 0) {
      return []
    }

    const inferred = [...monthDayEntries]
    const hasExplicitYear = inferred.every((entry) => Number.isInteger(entry.monthDay.year))

    if (hasExplicitYear) {
      return inferred
        .map((entry) => {
          const parsedDate = new Date(entry.monthDay.year, entry.monthDay.month, entry.monthDay.day)

          if (parsedDate > today) {
            return null
          }

          return {
            date: parsedDate,
            attendance: entry.attendance,
            rawLabel: entry.rawLabel,
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date)
    }

    // Legacy payload fallback: labels are month/day only (for example "Mar 14").
    // Infer year from the newest point so records remain chronological.
    const newest = inferred[inferred.length - 1]

    let inferredYear = today.getFullYear()
    const newestAsCurrentYear = new Date(
      inferredYear,
      newest.monthDay.month,
      newest.monthDay.day,
    )

    if (newestAsCurrentYear > today) {
      inferredYear -= 1
    }

    let nextMonth = newest.monthDay.month

    for (let index = inferred.length - 1; index >= 0; index -= 1) {
      const entry = inferred[index]

      if (index < inferred.length - 1 && entry.monthDay.month > nextMonth) {
        inferredYear -= 1
      }

      entry.date = new Date(inferredYear, entry.monthDay.month, entry.monthDay.day)
      nextMonth = entry.monthDay.month
    }

    return inferred
      .map((entry) => {
        const parsedDate = entry.date

        // Keep attendance calendar historical/current only; never show future-day data.
        if (parsedDate > today) {
          return null
        }

        return {
          date: parsedDate,
          attendance: entry.attendance,
          rawLabel: entry.rawLabel,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date)
  }, [attendanceTrend, today])

  const availableCalendarMonths = useMemo(() => {
    return [...new Set(normalizedAttendance.map((entry) => toMonthKey(entry.date)))].sort()
  }, [normalizedAttendance])

  const latestCalendarMonth = useMemo(() => {
    if (availableCalendarMonths.length > 0) {
      return availableCalendarMonths[availableCalendarMonths.length - 1]
    }
    return toMonthKey(new Date())
  }, [availableCalendarMonths])

  useEffect(() => {
    if (!selectedCalendarMonth) {
      setSelectedCalendarMonth(latestCalendarMonth)
      return
    }

    if (selectedCalendarMonth && selectedCalendarMonth > currentMonthKey) {
      setSelectedCalendarMonth(currentMonthKey)
      return
    }
  }, [selectedCalendarMonth, latestCalendarMonth, currentMonthKey])

  const attendanceCalendarData = useMemo(() => {
    const activeMonth = selectedCalendarMonth || latestCalendarMonth
    const [year, month] = activeMonth.split('-').map(Number)

    if (!year || !month) {
      return {
        monthLabel: 'Invalid month',
        cells: [],
      }
    }

    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0)

    const byDate = new Map(
      normalizedAttendance
        .filter((entry) => toMonthKey(entry.date) === activeMonth)
        .map((entry) => [toDateKey(entry.date), entry]),
    )

    const leadingBlankCount = monthStart.getDay()
    const leadingBlanks = Array.from({ length: leadingBlankCount }, (_, index) => ({
      key: `blank-${index}`,
      isBlank: true,
    }))

    const dayCells = Array.from({ length: monthEnd.getDate() }, (_, index) => {
      const dayDate = new Date(year, month - 1, index + 1)
      const key = toDateKey(dayDate)
      const entry = byDate.get(key)

      return {
        key,
        isBlank: false,
        dayNumber: dayDate.getDate(),
        attendance: entry?.attendance ?? null,
        level: entry ? getAttendanceLevel(entry.attendance) : 'none',
      }
    })

    return {
      monthLabel: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      cells: [...leadingBlanks, ...dayCells],
    }
  }, [normalizedAttendance, selectedCalendarMonth, latestCalendarMonth])

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
          <p>{totalStudents} total students across all courses</p>
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
            {legendWithOthers.map((entry, index) => (
              <li key={entry.course}>
                <span className="legend-name">
                  <span
                    className="legend-dot"
                    style={{ background: entry.isOthers ? '#95a5c5' : pieColors[index % pieColors.length] }}
                  />
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
        <div className="panel-header attendance-panel-header">
          <div>
            <h3>Attendance Over School Days</h3>
            <p>Line chart of daily attendance patterns</p>
          </div>
          <button
            type="button"
            className="chart-action-btn"
            onClick={() => setShowAttendanceCalendar(true)}
          >
            Show Calendar
          </button>
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

      {showAttendanceCalendar ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setShowAttendanceCalendar(false)}
        >
          <section
            className="modal-card panel attendance-calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Attendance calendar"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header attendance-modal-header">
              <div>
                <h3>Attendance Calendar</h3>
                <p>{attendanceCalendarData.monthLabel} attendance infographic</p>
              </div>
              <div className="attendance-modal-controls">
                <label htmlFor="attendance-month-picker" className="attendance-month-label">
                  Month
                </label>
                <input
                  id="attendance-month-picker"
                  type="month"
                  className="attendance-month-picker"
                  value={selectedCalendarMonth || latestCalendarMonth}
                  max={currentMonthKey}
                  onChange={(event) => setSelectedCalendarMonth(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="records-action-btn"
                onClick={() => setShowAttendanceCalendar(false)}
              >
                Close
              </button>
            </div>

            <div className="attendance-calendar-legend" aria-label="Attendance legend">
              <span className="legend-chip high">95% and above</span>
              <span className="legend-chip medium">85% to 94%</span>
              <span className="legend-chip low">Below 85%</span>
            </div>

            <div className="attendance-calendar-grid" role="table" aria-label="Monthly attendance calendar">
              {weekdayLabels.map((label) => (
                <div key={label} className="attendance-weekday" role="columnheader">
                  {label}
                </div>
              ))}

              {attendanceCalendarData.cells.map((cell) => {
                if (cell.isBlank) {
                  return <div key={cell.key} className="attendance-day-cell blank" role="cell" />
                }

                return (
                  <div key={cell.key} className={`attendance-day-cell ${cell.level}`} role="cell">
                    <strong>{cell.dayNumber}</strong>
                    {typeof cell.attendance === 'number' ? (
                      <>
                        <span className="attendance-percent">{Math.round(cell.attendance)}%</span>
                        <div className="attendance-meter">
                          <span style={{ width: `${Math.max(0, Math.min(100, cell.attendance))}%` }} />
                        </div>
                      </>
                    ) : (
                      <span className="attendance-empty">No data</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

export default EnrollmentCharts