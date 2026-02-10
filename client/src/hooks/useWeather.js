import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { groupForecast } from '../lib/weather'

const cache = new Map()

export function useWeather(city) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const active = useRef(true)

  const load = useCallback(async () => {
    if (!city) return
    const key = city.toLowerCase()
    if (cache.has(key)) { setData(cache.get(key)); return }

    setLoading(true)
    setError(null)

    try {
      const [w, f] = await Promise.all([
        api.weather(city),
        api.forecast(city),
      ])

      let uvi = null
      try {
        const u = await api.uv(w.coord.lat, w.coord.lon)
        uvi = u.uvi
      } catch {}

      const result = {
        name:       w.name,
        country:    w.sys.country,
        temp:       Math.round(w.main.temp),
        feels:      Math.round(w.main.feels_like),
        humidity:   w.main.humidity,
        wind:       Math.round(w.wind.speed * 3.6),
        windDeg:    w.wind.deg,
        visibility: Math.round((w.visibility || 0) / 1000),
        pressure:   w.main.pressure,
        condition:  w.weather[0].description,
        code:       w.weather[0].id,
        lat:        w.coord.lat,
        lon:        w.coord.lon,
        uvi,
        forecast:   groupForecast(f.list),
        hourly:     f.list.slice(0, 8).map(h => ({
          dt:   h.dt,
          temp: Math.round(h.main.temp),
          code: h.weather[0].id,
          desc: h.weather[0].description,
        })),
      }

      if (!active.current) return
      cache.set(key, result)
      setData(result)
    } catch (e) {
      if (active.current) setError(e.message)
    } finally {
      if (active.current) setLoading(false)
    }
  }, [city])

  useEffect(() => {
    active.current = true
    load()
    return () => { active.current = false }
  }, [load])

  return { data, loading, error }
}
