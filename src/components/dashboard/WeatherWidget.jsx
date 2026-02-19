function WeatherWidget({ weather, loading, error }) {
  return (
    <article className="panel weather-panel">
      <div className="panel-header">
        <h3>Campus Weather</h3>
        <p>Live forecast snapshot</p>
      </div>

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
        </>
      )}
    </article>
  )
}

export default WeatherWidget