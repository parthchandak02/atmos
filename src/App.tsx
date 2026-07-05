import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Atmosphere from './components/Atmosphere'
import DataStamp from './components/DataStamp'
import Desc from './components/Desc'
import HeroMetric from './components/HeroMetric'
import Legend from './components/Legend'
import QuietZone from './components/QuietZone'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useWeather } from './hooks/useWeather'
import './index.css'

export default function App() {
  const { data, loading, source, secondsAgo } = useWeather()
  const reducedMotion = useReducedMotion()
  const [detailVisible, setDetailVisible] = useState(false)
  const [showGlow, setShowGlow] = useState(!reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setShowGlow(false)
      return
    }
    const t = setTimeout(() => setShowGlow(false), 500)
    return () => clearTimeout(t)
  }, [reducedMotion])

  const handleTap = useCallback(() => {
    setDetailVisible(true)
  }, [])

  const handleHideDetail = useCallback(() => {
    setDetailVisible(false)
  }, [])

  return (
    <>
      <Canvas
        className="atmos-canvas"
        camera={{ position: [0, 2, 6], fov: 60, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ camera, gl }) => {
          gl.setPixelRatio(window.devicePixelRatio)
          camera.lookAt(0, 12, -30)
        }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        onClick={handleTap}
        onPointerDown={handleTap}
      >
        <Suspense fallback={null}>
          <Atmosphere weather={data} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>

      {showGlow && <div className="first-visit-glow" aria-hidden />}

      <HeroMetric weather={data} />
      <DataStamp
        weather={data}
        secondsAgo={secondsAgo}
        loading={loading}
        source={source}
      />
      <Desc />
      <QuietZone
        visible={detailVisible}
        onHide={handleHideDetail}
        weather={data}
      />
      <Legend weather={data} />
    </>
  )
}
