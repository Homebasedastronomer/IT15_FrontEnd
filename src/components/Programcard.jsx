function Programcard({ program, onSelect }) {
  return (
    <article className="panel module-card">
      <div className="module-card-header">
        <h3>{program.code}</h3>
        <span className={`status-pill ${program.status.toLowerCase().replaceAll(' ', '-')}`}>
          {program.status}
        </span>
      </div>

      <p className="module-card-title">{program.name}</p>
      <p>
        {program.type} · {program.duration}
      </p>
      <p>Total Units Required: {program.totalUnits}</p>

      <div className="module-card-actions">
        <button type="button" onClick={() => onSelect(program)}>
          View Details
        </button>
      </div>
    </article>
  )
}

export default Programcard