function Topbar({ title, subtitle }) {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-meta">
        <span className="live-badge">
          <span className="live-dot" />
          Live
        </span>
        <div className="topbar-date">{dateLabel}</div>
      </div>
    </header>
  )
}

export default Topbar