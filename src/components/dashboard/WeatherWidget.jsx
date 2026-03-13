import { useState } from 'react'

function WeatherWidget({ weather, loading, error, onSearchLocation, searchLoading }) {
  const [location, setLocation] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!location.trim()) {
      return
    }

    onSearchLocation(location.trim())
  }

  return (
    <article className="panel weather-panel">
      <div className="panel-header">
        <h3>Campus Weather</h3>
      </div>

      <form className="weather-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search city (e.g., Tagum)"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button type="submit" disabled={searchLoading}>
          {searchLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && <p className="status-text">Loading weather...</p>}

      {error && !loading && <p className="status-text error">{error}</p>}

      {!loading && weather && (
        <>
          <div className="weather-current">
            <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
            <div>
              <h4>{weather.summary}</h4>
              <p>Feels like {Math.round(weather.feelsLike)}°C</p>
            </div>
          </div>

          <div className="weather-meta">
            <p>Wind: {weather.windSpeed} km/h</p>
            <p>Rain chance: {weather.rainChance}%</p>
          </div>

          {Array.isArray(weather.forecast) && weather.forecast.length ? (
            <div className="weather-forecast" aria-label="Five day forecast">
              {weather.forecast.slice(0, 5).map((day) => (
                <article key={day.date} className="forecast-item">
                  <p>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <strong>
                    {Math.round(day.high)}° / {Math.round(day.low)}°
                  </strong>
                  <span>{day.rainChance}% rain</span>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </article>
  )
}

export default WeatherWidget