function Programdetails({ program, onEdit, onDelete }) {
  if (!program) {
    return (
      <article className="panel module-empty">
        <h3>Course Details</h3>
        <p>Select a course to view complete information.</p>
      </article>
    )
  }

  return (
    <article className="panel module-detail-card program-detail-card">
      <div className="panel-header">
        <h3>
          {program.code} · {program.name}
        </h3>
        <p>{program.description}</p>
      </div>

      <div className="module-detail-grid">
        <p>
          <strong>Course Code:</strong> {program.code}
        </p>
        <p>
          <strong>Course Type:</strong> {program.type}
        </p>
        <p>
          <strong>Department:</strong> {program.department || 'N/A'}
        </p>
        <p>
          <strong>Duration:</strong> {program.duration}
        </p>
        <p>
          <strong>Total Units:</strong> {program.totalUnits}
        </p>
      </div>

      <div className="module-detail-actions">
        <button type="button" onClick={() => onEdit(program)}>
          Edit
        </button>
        <button type="button" className="danger-btn" onClick={() => onDelete(program)}>
          Delete
        </button>
      </div>

      <div className="year-levels-grid">
        {Object.entries(program.yearLevels).map(([yearLevel, yearSubjects]) => (
          <section key={yearLevel} className="year-level-card">
            <h4>{yearLevel}</h4>
            <ul>
              {yearSubjects.map((subject) => (
                <li key={subject}>{subject}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}

export default Programdetails