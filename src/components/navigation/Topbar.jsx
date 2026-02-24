function Topbar({ title, subtitle, weather, weatherLoading }) {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="topbar-meta">
        <span className="weather-badge">
          {weatherLoading || !weather
            ? 'Weather loading...'
            : `${Math.round(weather.temperature)}°C · ${weather.summary}`}
        </span>
        <div className="topbar-date">{dateLabel}</div>
      </div>
    </header>
  )
}

export default Topbar