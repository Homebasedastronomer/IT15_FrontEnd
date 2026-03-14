import { useState } from 'react'
import ForecastDisplay, { getForecastSceneFromCode } from './ForecastDisplay'

const getWeatherTone = (summary = '') => {
  const normalized = summary.toLowerCase()

  if (normalized.includes('rain') || normalized.includes('storm')) {
    return 'rain'
  }

  if (normalized.includes('clear') || normalized.includes('sun')) {
    return 'sun'
  }

  return 'cloud'
}

const getWeatherScene = (summary = '', isDay = true) => {
  const normalized = summary.toLowerCase()

  if (normalized.includes('thunder')) {
    return 'storm'
  }

  if (normalized.includes('snow')) {
    return 'snow'
  }

  if (normalized.includes('rain')) {
    return 'rain'
  }

  if (normalized.includes('fog')) {
    return 'fog'
  }

  if (!isDay && (normalized.includes('clear') || normalized.includes('partly'))) {
    return 'moon'
  }

  if (normalized.includes('clear') || normalized.includes('sun')) {
    return 'sun'
  }

  return 'cloud'
}

function WeatherWidget({ weather, loading, error, onSearchLocation, searchLoading }) {
  const [location, setLocation] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!location.trim()) {
      return
    }

    onSearchLocation(location.trim())
  }

  const tone = getWeatherTone(weather?.summary)
  const hourNow = new Date().getHours()
  const isDay = typeof weather?.isDay === 'boolean' ? weather.isDay : hourNow >= 6 && hourNow < 18
  const scene = Number.isFinite(Number(weather?.weatherCode))
    ? getForecastSceneFromCode(weather.weatherCode, isDay)
    : getWeatherScene(weather?.summary, isDay)
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className={`panel weather-panel weather-panel-${tone} weather-scene-${scene}`}>
      <div className="weather-ambient" aria-hidden="true">
        <span className="weather-orb weather-orb-one" />
        <span className="weather-orb weather-orb-two" />
      </div>

      <div className="panel-header">
        <div>
          <h3>Campus Weather</h3>
          <p>{weather?.location || 'Tagum City'} - {dateLabel}</p>
        </div>
        <span className="weather-live-pill">Live Conditions</span>
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
          <section className="weather-hero">
            <div className="weather-scene" aria-hidden="true">
              <span className="scene-sky-body" />
              <span className="scene-cloud scene-cloud-one" />
              <span className="scene-cloud scene-cloud-two" />
              <span className="scene-rain scene-rain-one" />
              <span className="scene-rain scene-rain-two" />
              <span className="scene-snow scene-snow-one" />
              <span className="scene-snow scene-snow-two" />
              <span className="scene-lightning" />
              <span className="scene-fog scene-fog-one" />
              <span className="scene-fog scene-fog-two" />
            </div>
            <div className="weather-temp-block">
              <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
              <p>Feels like {Math.round(weather.feelsLike)}°C</p>
            </div>
            <div className="weather-summary-block">
              <h4>{weather.summary}</h4>
              <p>Watch for weather changes throughout the day.</p>
            </div>
          </section>

          <section className="weather-meta" aria-label="Current weather details">
            <article>
              <p className="meta-label">Wind</p>
              <strong>{weather.windSpeed} km/h</strong>
            </article>
            <article>
              <p className="meta-label">Rain Chance</p>
              <strong>{weather.rainChance}%</strong>
            </article>
            <article>
              <p className="meta-label">Location</p>
              <strong>{weather.location || 'Campus'}</strong>
            </article>
          </section>

          <ForecastDisplay forecast={weather.forecast} isDay={isDay} />
        </>
      )}
    </article>
  )
}

export default WeatherWidget
