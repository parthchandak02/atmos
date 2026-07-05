export interface WeatherCurrent {
  temperature_2m: number
  wind_speed_10m: number
  relative_humidity_2m: number
  cloud_cover: number
  is_day: number
  weather_code: number
  precipitation: number
  rain: number
  time: string
}

export const WEATHER_API =
  'https://api.open-meteo.com/v1/forecast?latitude=37.77&longitude=-122.42&current=temperature_2m,wind_speed_10m,relative_humidity_2m,cloud_cover,is_day,weather_code,precipitation,rain&timezone=auto'

export const WEATHER_FALLBACK: WeatherCurrent = {
  is_day: 1,
  temperature_2m: 18,
  cloud_cover: 40,
  wind_speed_10m: 12,
  weather_code: 0,
  relative_humidity_2m: 65,
  rain: 0,
  precipitation: 0,
  time: new Date().toISOString(),
}

export type WeatherCategory =
  | 'clear'
  | 'cloudy'
  | 'foggy'
  | 'rainy'
  | 'showers'
  | 'storm'
  | 'snow'

export function getWeatherCategory(code: number): WeatherCategory {
  if (code >= 95) return 'storm'
  if (code >= 80) return 'showers'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 51) return 'rainy'
  if (code >= 45) return 'foggy'
  if (code >= 4) return 'cloudy'
  return 'clear'
}

export function isRainyCode(code: number): boolean {
  return (code >= 51 && code <= 65) || (code >= 80 && code <= 82) || code >= 95
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  }
  if (descriptions[code]) return descriptions[code]
  const cat = getWeatherCategory(code)
  if (cat === 'cloudy') return 'Cloudy'
  if (cat === 'foggy') return 'Foggy'
  if (cat === 'rainy') return 'Rain'
  if (cat === 'showers') return 'Rain showers'
  if (cat === 'storm') return 'Thunderstorm'
  if (cat === 'snow') return 'Snow'
  return 'Clear sky'
}

export function getDataStampState(weather: WeatherCurrent): string {
  const cat = getWeatherCategory(weather.weather_code)
  if (!weather.is_day) return 'night'
  return cat
}

export function getSunPosition(): [number, number, number] {
  const now = new Date()
  const hours = now.getHours() + now.getMinutes() / 60
  const dayProgress = ((hours - 6) / 12) * Math.PI
  const elevation = Math.max(0, Math.sin(dayProgress)) * 80
  const azimuth = ((hours - 6) / 24) * Math.PI
  return [Math.cos(azimuth) * 100, elevation, Math.sin(azimuth) * 50]
}

export function getCloudCount(cloudCover: number): number {
  return Math.min(5, Math.max(0, Math.round(cloudCover / 20)))
}

export function getCloudSpeed(windSpeed: number): number {
  return windSpeed * 0.02
}

export function getTurbidityFromTemp(tempC: number): number {
  return 2 + (Math.min(40, Math.max(0, tempC)) / 40) * 12
}
