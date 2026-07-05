import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cloud, Clouds, Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'
import {
  getCloudCount,
  getCloudSpeed,
  getSunPosition,
  getTurbidityFromTemp,
  getWeatherCategory,
  type WeatherCurrent,
} from '../lib/weather'
import { PALETTE } from '../lib/palette'
import RainParticles from './RainParticles'

interface AtmosphereProps {
  weather: WeatherCurrent
  reducedMotion: boolean
}

function DriftingClouds({
  count,
  speed,
  opacity,
  reducedMotion,
  isNight,
}: {
  count: number
  speed: number
  opacity: number
  reducedMotion: boolean
  isNight: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const wrapSpan = 28

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return
    groupRef.current.position.x += speed * delta
    if (groupRef.current.position.x > wrapSpan) {
      groupRef.current.position.x -= wrapSpan * 2
    }
  })

  if (count === 0) return null

  const cloudColor = isNight ? '#1a2a40' : '#ffffff'

  return (
    <group ref={groupRef} position={[0, 8, -20]}>
      <Clouds material={THREE.MeshLambertMaterial}>
        {Array.from({ length: count }, (_, i) => (
          <Cloud
            key={i}
            seed={i + 1}
            bounds={[12, 2, 2]}
            volume={8 + (i % 3) * 2}
            color={cloudColor}
            opacity={opacity}
            position={[
              (i - count / 2) * 6 + (i % 2) * 2,
              (i % 3) * 1.2,
              (i % 2) * 3 - 1,
            ]}
          />
        ))}
      </Clouds>
    </group>
  )
}

function Moon() {
  return (
    <group position={[30, 35, -60]}>
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#e8eef8" />
      </mesh>
      <pointLight color="#b8c8e8" intensity={0.6} distance={120} />
    </group>
  )
}

function FogHaze({ density }: { density: number }) {
  return (
    <fog attach="fog" args={[PALETTE.layer, 10, 10 + density * 0.8]} />
  )
}

function LightningFlash({
  active,
  reducedMotion,
}: {
  active: boolean
  reducedMotion: boolean
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const nextFlash = useRef(0)

  useFrame(({ clock }) => {
    if (!active || reducedMotion || !lightRef.current) return
    const t = clock.getElapsedTime()
    if (t > nextFlash.current) {
      nextFlash.current = t + 2 + Math.random() * 4
      lightRef.current.intensity = 2.5
    } else if (lightRef.current.intensity > 0) {
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 0.15)
    }
  })

  if (!active) return null

  return (
    <directionalLight
      ref={lightRef}
      position={[10, 50, -10]}
      intensity={0}
      color="#e8f0ff"
    />
  )
}

function AtmosphereInner({ weather, reducedMotion }: AtmosphereProps) {
  const isDay = weather.is_day === 1
  const category = getWeatherCategory(weather.weather_code)
  const cloudCount = getCloudCount(weather.cloud_cover)
  const cloudSpeed = getCloudSpeed(weather.wind_speed_10m)
  const turbidity = getTurbidityFromTemp(weather.temperature_2m)
  const sunPosition = useMemo(() => getSunPosition(), [])

  const cloudOpacity = useMemo(() => {
    const base = 0.35 + (weather.cloud_cover / 100) * 0.55
    if (category === 'storm') return Math.min(1, base + 0.2)
    if (category === 'foggy') return Math.min(0.9, base + 0.15)
    return base
  }, [weather.cloud_cover, category])

  const ambientIntensity = useMemo(() => {
    if (!isDay) return 0.12
    if (category === 'storm') return 0.18
    if (category === 'rainy' || category === 'showers') return 0.22
    if (category === 'foggy') return 0.28
    return 0.35
  }, [isDay, category])

  const starOpacity = useMemo(() => {
    if (isDay) return 0
    const coverFactor = 1 - weather.cloud_cover / 100
    return Math.max(0.15, coverFactor)
  }, [isDay, weather.cloud_cover])

  return (
    <>
      <color attach="background" args={[isDay ? PALETTE.bg : PALETTE.nightBg]} />

      <ambientLight intensity={ambientIntensity} />
      {isDay && (
        <directionalLight
          position={sunPosition}
          intensity={category === 'storm' ? 0.3 : category === 'cloudy' ? 0.65 : 0.9}
          color="#fff8e8"
        />
      )}

      {isDay && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={turbidity}
          rayleigh={category === 'storm' ? 0.5 : 2}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      {!isDay && (
        <Stars
          radius={80}
          depth={40}
          count={reducedMotion ? 1500 : 4000}
          factor={3}
          saturation={0.1}
          fade
          speed={reducedMotion ? 0 : 0.3}
        />
      )}

      {!isDay && <Moon />}

      <DriftingClouds
        count={cloudCount}
        speed={cloudSpeed}
        opacity={cloudOpacity}
        reducedMotion={reducedMotion}
        isNight={!isDay}
      />

      {(category === 'foggy' || weather.relative_humidity_2m > 75) && (
        <FogHaze
          density={
            category === 'foggy'
              ? 60 + weather.relative_humidity_2m * 0.3
              : weather.relative_humidity_2m * 0.5
          }
        />
      )}

      <RainParticles
        weather={weather}
        reducedMotion={reducedMotion}
        windSpeed={weather.wind_speed_10m}
      />

      <LightningFlash active={category === 'storm'} reducedMotion={reducedMotion} />

      {!isDay && starOpacity < 0.5 && (
        <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#0a1628" transparent opacity={0.35} />
        </mesh>
      )}
    </>
  )
}

export default function Atmosphere(props: AtmosphereProps) {
  return (
    <Suspense fallback={null}>
      <AtmosphereInner {...props} />
    </Suspense>
  )
}
