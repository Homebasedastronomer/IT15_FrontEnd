function Subjectdetails({ subject, onEdit, onDelete }) {
  if (!subject) {
    return null
  }

  return (
    <article className="panel module-detail-card subject-detail-card">
      <div className="panel-header">
        <h3>
          {subject.code} · {subject.title}
        </h3>
        <p>{subject.description}</p>
      </div>

      <div className="module-detail-grid">
        <p>
          <strong>Units:</strong> {subject.units}
        </p>
        <p>
          <strong>Semester/Term Offered:</strong> {subject.offeredIn}
        </p>
        <p>
          <strong>Program Assignment:</strong> {subject.programCode}
        </p>
        <p>
          <strong>Term Indicator:</strong> {subject.termIndicator}
        </p>
      </div>

      <div className="subject-requisite-grid">
        <section className="year-level-card">
          <h4>Pre-requisites</h4>
          {subject.prerequisites.length ? (
            <ul>
              {subject.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>none</p>
          )}
        </section>

        <section className="year-level-card">
          <h4>Co-requisites</h4>
          {subject.corequisites.length ? (
            <ul>
              {subject.corequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>none</p>
          )}
        </section>
      </div>

      <div className="module-detail-actions">
        <button type="button" onClick={() => onEdit(subject)}>
          Edit
        </button>
        <button type="button" className="danger-btn" onClick={() => onDelete(subject)}>
          Delete
        </button>
      </div>
    </article>
  )
}

export default Subjectdetails