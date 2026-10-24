import type { CSSProperties } from 'react'
import { PALETTE } from '../lib/palette'

const containerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 68,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 11,
  textAlign: 'center',
  maxWidth: '90vw',
}

export default function Desc({ isDay }: { isDay: boolean }) {
  return (
    <div
      id="desc"
      style={{ ...containerStyle, ...(isDay
          ? { color: PALETTE.text, opacity: 0.45 }
          : { color: PALETTE.nightText, opacity: 0.65 }) }}
    >
      SF weather as a living sky - clouds, sun, and rain from real data
    </div>
  )
}
