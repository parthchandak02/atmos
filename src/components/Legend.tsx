import type { WeatherCurrent } from '../lib/weather'
import { PALETTE } from '../lib/palette'

interface LegendProps {
  weather: WeatherCurrent
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 44,
  right: 20,
  zIndex: 10,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 9,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  alignItems: 'flex-end',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

export default function Legend({ weather }: LegendProps) {
  const isDay = weather.is_day === 1
  const dayNightIcon = isDay ? '☀' : '☾'
  const dayNightLabel = isDay ? 'day' : 'night'

  return (
    <div style={{ ...containerStyle, ...(isDay
          ? { color: PALETTE.text, opacity: 0.35 }
          : { color: PALETTE.nightText, opacity: 0.6 }) }}>
      <div style={rowStyle}>
        <span aria-hidden>{dayNightIcon}</span>
        <span>{dayNightLabel}</span>
      </div>
      <div style={rowStyle}>
        <span aria-hidden>↝</span>
        <span>{Math.round(weather.wind_speed_10m)} km/h wind</span>
      </div>
    </div>
  )
}
