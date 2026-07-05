import type { CSSProperties } from 'react'
import { getWeatherDescription, type WeatherCurrent } from '../lib/weather'
import { PALETTE } from '../lib/palette'

interface HeroMetricProps {
  weather: WeatherCurrent
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 24,
  left: 24,
  zIndex: 10,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

export default function HeroMetric({ weather }: HeroMetricProps) {
  const temp = Math.round(weather.temperature_2m)
  const description = getWeatherDescription(weather.weather_code)

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: PALETTE.text,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {temp}°C
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: PALETTE.text,
          opacity: 0.65,
        }}
      >
        {description}
      </div>
    </div>
  )
}
