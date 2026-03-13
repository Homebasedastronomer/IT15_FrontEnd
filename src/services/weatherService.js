const CAMPUS_COORDS = {
  latitude: 14.5995,
  longitude: 120.9842,
  city: 'Tagum City',
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
  return getWeatherByCoordinates(CAMPUS_COORDS.latitude, CAMPUS_COORDS.longitude, CAMPUS_COORDS.city)
}

async function geocodeCity(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: '1',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`)

  if (response.status === 429) {
    throw new Error('Location search is rate-limited. Please try again shortly.')
  }

  if (!response.ok) {
    throw new Error('Unable to geocode location')
  }

  const data = await response.json()
  const first = data.results?.[0]

  if (!first) {
    throw new Error('Location not found')
  }

  return {
    latitude: first.latitude,
    longitude: first.longitude,
    label: `${first.name}${first.country ? `, ${first.country}` : ''}`,
  }
}

async function getWeatherByCoordinates(latitude, longitude, locationLabel = 'Campus') {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)

  if (response.status === 429) {
    throw new Error('Weather API rate limit reached. Please try again in a moment.')
  }

  if (!response.ok) {
    throw new Error('Weather API request failed')
  }

  const data = await response.json()

  const forecast = (data.daily.time || []).map((date, index) => ({
    date,
    summary: toWeatherLabel(data.daily.weather_code?.[index]),
    high: data.daily.temperature_2m_max?.[index],
    low: data.daily.temperature_2m_min?.[index],
    rainChance: data.daily.precipitation_probability_max?.[index] ?? 0,
  }))

  return {
    location: locationLabel,
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    summary: toWeatherLabel(data.current.weather_code),
    windSpeed: data.current.wind_speed_10m,
    rainChance: data.daily.precipitation_probability_max?.[0] ?? 0,
    forecast,
  }
}

export async function getWeatherByLocation(cityName) {
  const location = await geocodeCity(cityName)
  return getWeatherByCoordinates(location.latitude, location.longitude, location.label)
}