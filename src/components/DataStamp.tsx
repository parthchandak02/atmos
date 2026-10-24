import type { CSSProperties } from 'react'
import { getDataStampState, type WeatherCurrent } from '../lib/weather'
import type { WeatherSource } from '../hooks/useWeather'
import { PALETTE } from '../lib/palette'

interface DataStampProps {
  weather: WeatherCurrent
  secondsAgo: number
  loading: boolean
  source: WeatherSource
}

const containerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 20,
  left: 16,
  zIndex: 10,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 10,
}

export default function DataStamp({ weather, secondsAgo, loading, source }: DataStampProps) {
  const state = getDataStampState(weather)
  const ago = loading ? '...' : `${secondsAgo}s ago`
  const label = source === 'live' ? 'live' : source

  return (
    <div
      id="stamp"
      style={{ ...containerStyle, ...(weather.is_day
          ? { color: PALETTE.text, opacity: 0.4 }
          : { color: PALETTE.nightText, opacity: 0.6 }) }}
    >
      Open-Meteo · SF · {state} · <strong>{label}</strong> · {ago}
    </div>
  )
}
