import { useCallback, useEffect, useRef, useState } from 'react'
import {
  WEATHER_API,
  WEATHER_FALLBACK,
  type WeatherCurrent,
} from '../lib/weather'

const POLL_MS = 60_000
const CACHE_KEY = 'atmos-weather-v1'

export type WeatherSource = 'live' | 'cached' | 'fallback'

export interface WeatherState {
  data: WeatherCurrent
  loading: boolean
  error: string | null
  source: WeatherSource
  lastUpdated: number | null
  secondsAgo: number
}

export function useWeather(): WeatherState {
  const [data, setData] = useState<WeatherCurrent>(WEATHER_FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<WeatherSource>('fallback')
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const mounted = useRef(true)

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch(WEATHER_API, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!mounted.current) return
      const current = json.current as WeatherCurrent
      setData(current)
      setSource('live')
      setLastUpdated(Date.now())
      setError(null)
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ current, saved: Date.now() }))
      } catch { /* ignore */ }
    } catch (e) {
      if (!mounted.current) return
      setError(e instanceof Error ? e.message : 'Fetch failed')
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { current } = JSON.parse(cached)
          setData(current)
          setSource('cached')
          setLastUpdated(Date.now())
          return
        }
      } catch { /* ignore */ }
      setData(WEATHER_FALLBACK)
      setSource('fallback')
      setLastUpdated(Date.now())
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    fetchWeather()
    const poll = setInterval(fetchWeather, POLL_MS)
    return () => {
      mounted.current = false
      clearInterval(poll)
    }
  }, [fetchWeather])

  useEffect(() => {
    const tick = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [lastUpdated])

  return { data, loading, error, source, lastUpdated, secondsAgo }
}
