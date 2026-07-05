import { useEffect, useRef } from 'react'
import { getWeatherDescription, type WeatherCurrent } from '../lib/weather'
import { PALETTE, ALPHA } from '../lib/palette'

interface QuietZoneProps {
  visible: boolean
  onHide: () => void
  weather: WeatherCurrent
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
  padding: '20px 28px',
  borderRadius: 16,
  background: `rgba(232, 244, 248, ${ALPHA.active})`,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid rgba(129, 212, 250, ${ALPHA.field})`,
  boxShadow: '0 4px 20px rgba(129, 212, 250, 0.15)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: PALETTE.text,
  minWidth: 220,
  transition: 'opacity 0.4s ease',
  pointerEvents: 'none',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  fontSize: 13,
  marginBottom: 8,
}

const labelStyle: React.CSSProperties = {
  opacity: ALPHA.label,
}

const valueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: PALETTE.accent1,
}

export default function QuietZone({ visible, onHide, weather }: QuietZoneProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (visible) {
      timerRef.current = setTimeout(onHide, 3000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visible, onHide])

  const description = getWeatherDescription(weather.weather_code)

  return (
    <div
      style={{
        ...panelStyle,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden={!visible}
    >
      <div style={{ fontSize: 11, opacity: ALPHA.label, marginBottom: 12 }}>
        Tap anywhere for details
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Wind</span>
        <span style={valueStyle}>{Math.round(weather.wind_speed_10m)} km/h</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Humidity</span>
        <span style={valueStyle}>{Math.round(weather.relative_humidity_2m)}%</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Cloud cover</span>
        <span style={valueStyle}>{Math.round(weather.cloud_cover)}%</span>
      </div>
      <div style={{ ...rowStyle, marginBottom: 0 }}>
        <span style={labelStyle}>Conditions</span>
        <span style={valueStyle}>{description}</span>
      </div>
    </div>
  )
}
