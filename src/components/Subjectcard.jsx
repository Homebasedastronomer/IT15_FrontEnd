function Subjectcard({ subject, onSelect }) {
  return (
    <article className="panel module-card">
      <div className="module-card-header">
        <h3>{subject.code}</h3>
        <span className="term-pill">{subject.termIndicator}</span>
      </div>

      <p className="module-card-title">{subject.title}</p>
      <p>{subject.units} Units</p>
      <p>{subject.offeredIn}</p>
      <p>Program: {subject.programCode}</p>

      <div className="module-card-actions">
        <button type="button" onClick={() => onSelect(subject)}>
          View Details
        </button>
      </div>
    </article>
  )
}

export default Subjectcard