import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isRainyCode, type WeatherCurrent } from '../lib/weather'

interface RainParticlesProps {
  weather: WeatherCurrent
  reducedMotion: boolean
  windSpeed: number
}

const PARTICLE_COUNT = 3500
const SPREAD_X = 40
const SPREAD_Y = 30
const SPREAD_Z = 20
const FALL_SPEED = 18
const BASE_Y = 15

export default function RainParticles({
  weather,
  reducedMotion,
  windSpeed,
}: RainParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const active = isRainyCode(weather.weather_code)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD_X
      positions[i * 3 + 1] = Math.random() * SPREAD_Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - 10
      velocities[i * 3] = windSpeed * 0.04
      velocities[i * 3 + 1] = -(FALL_SPEED + Math.random() * 4)
      velocities[i * 3 + 2] = 0
    }
    return { positions, velocities }
  }, [windSpeed])

  useEffect(() => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }, [positions])

  useFrame((_, delta) => {
    if (!active || reducedMotion || !pointsRef.current) return
    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] += velocities[i * 3] * delta
      arr[i * 3 + 1] += velocities[i * 3 + 1] * delta

      if (arr[i * 3 + 1] < -5) {
        arr[i * 3] = (Math.random() - 0.5) * SPREAD_X
        arr[i * 3 + 1] = BASE_Y + Math.random() * 5
        arr[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z - 10
      }
      if (arr[i * 3] > SPREAD_X / 2) arr[i * 3] = -SPREAD_X / 2
      if (arr[i * 3] < -SPREAD_X / 2) arr[i * 3] = SPREAD_X / 2
    }
    pos.needsUpdate = true
  })

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.06}
        color="#b8d8f0"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
