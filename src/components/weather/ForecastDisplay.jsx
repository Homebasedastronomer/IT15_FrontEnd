const getForecastScene = (summary = '', isDay = true) => {
  const normalized = summary.toLowerCase()

  if (normalized.includes('thunder')) return 'storm'
  if (normalized.includes('snow')) return 'snow'
  if (normalized.includes('rain')) return 'rain'
  if (normalized.includes('fog')) return 'fog'
  if (normalized.includes('overcast') || normalized.includes('cloud')) return 'cloud'
  if (normalized.includes('clear')) return isDay ? 'sun' : 'moon'

  return 'cloud'
}

const FORECAST_ICON_META = {
  sun: { label: 'Sunny' },
  moon: { label: 'Clear Night' },
  rain: { label: 'Rainy' },
  cloud: { label: 'Cloudy' },
  fog: { label: 'Foggy' },
  snow: { label: 'Snow' },
  storm: { label: 'Storm' },
}

function ForecastIcon({ type }) {
  if (type === 'sun') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <circle cx="12" cy="12" r="4.4" fill="#FFC940" stroke="#F59E0B" strokeWidth="1" />
        <path
          d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.8 5.8l1.7 1.7M16.5 16.5l1.7 1.7M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (type === 'moon') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <path d="M15.6 3.6a8.5 8.5 0 1 0 4.8 12.6 7.3 7.3 0 1 1-4.8-12.6z" fill="#C7D2FE" />
      </svg>
    )
  }

  if (type === 'rain') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <path d="M7.5 14.2h8.2a3.6 3.6 0 0 0 .2-7.2 5 5 0 0 0-9.7 1.2 3.2 3.2 0 0 0 1.3 6z" fill="#93C5FD" />
        <path d="M9.2 16.6l-.8 2.1M13 16.6l-.8 2.1M16.8 16.6l-.8 2.1" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'snow') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <path d="M8 13.6h8a3.3 3.3 0 0 0 .2-6.6A4.7 4.7 0 0 0 7 8.2a3 3 0 0 0 1 5.4z" fill="#BFDBFE" />
        <path d="M10 17.4h4M12 15.4v4M10.7 16.1l2.6 2.6M13.3 16.1l-2.6 2.6" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'storm') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <path d="M7.5 13.8h8.1a3.5 3.5 0 0 0 .2-7A5 5 0 0 0 6.6 8a3.1 3.1 0 0 0 .9 5.8z" fill="#A5B4FC" />
        <path d="M12 14.4l-1.2 2.7h1.5l-1 2.3" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'fog') {
    return (
      <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
        <path d="M7.2 12.5h8.4a3.2 3.2 0 0 0 .2-6.4A4.8 4.8 0 0 0 7 7.3a2.9 2.9 0 0 0 .2 5.2z" fill="#CBD5E1" />
        <path d="M6 16.5h12M7.5 19h9" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="forecast-icon-svg" aria-hidden="true">
      <path d="M7.2 14h9a3.7 3.7 0 1 0 .3-7.4A5.1 5.1 0 0 0 6.7 8 3.3 3.3 0 0 0 7.2 14z" fill="#94A3B8" />
    </svg>
  )
}

function ForecastDisplay({ forecast, isDay }) {
  if (!Array.isArray(forecast) || !forecast.length) {
    return null
  }

  return (
    <div className="weather-forecast" aria-label="Five day forecast">
      {forecast.slice(0, 5).map((day) => {
        const iconType = getForecastScene(day.summary, isDay)
        const iconMeta = FORECAST_ICON_META[iconType] || FORECAST_ICON_META.cloud

        return (
          <article key={day.date} className="forecast-item">
            <span className={`forecast-icon forecast-icon-${iconType}`} aria-label={iconMeta.label} role="img">
              <ForecastIcon type={iconType} />
            </span>
            <p>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <strong>
              {Math.round(day.high)}° / {Math.round(day.low)}°
            </strong>
            <span className="forecast-summary">{day.summary}</span>
            <em>{day.rainChance}% rain</em>
          </article>
        )
      })}
    </div>
  )
}

export default ForecastDisplay
