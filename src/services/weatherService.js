const CAMPUS_COORDS = {
  latitude: 14.5995,
  longitude: 120.9842,
}

function toWeatherLabel(code) {
  if (code === 0) return 'Clear Sky'
  if ([1, 2].includes(code)) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Foggy'
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain Showers'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Variable Weather'
}

export async function getCampusWeather() {
  const params = new URLSearchParams({
    latitude: CAMPUS_COORDS.latitude,
    longitude: CAMPUS_COORDS.longitude,
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '1',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Weather API request failed')
  }

  const data = await response.json()

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    summary: toWeatherLabel(data.current.weather_code),
    windSpeed: data.current.wind_speed_10m,
    rainChance: data.daily.precipitation_probability_max?.[0] ?? 0,
  }
}