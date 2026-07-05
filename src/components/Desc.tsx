import type { CSSProperties } from 'react'

const containerStyle: CSSProperties = {
  position: 'fixed',
  bottom: 68,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 11,
  color: 'rgba(0,0,0,0.5)',
  opacity: 0.45,
  textAlign: 'center',
  maxWidth: '90vw',
}

export default function Desc() {
  return (
    <div id="desc" style={containerStyle}>
      SF weather as a living sky - clouds, sun, and rain from real data
    </div>
  )
}
