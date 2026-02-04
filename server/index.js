import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3001
const KEY  = process.env.OWM_API_KEY

if (!KEY) {
  console.error('❌  OWM_API_KEY not set in .env')
  process.exit(1)
}

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Simple in-memory cache
const cache = new Map()
const TTL   = 10 * 60 * 1000 // 10 minutes

function cached(key, fn) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < TTL) return hit.data
  return null
}

function store(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

const OWM = 'https://api.openweathermap.org/data/2.5'
const GEO = 'https://api.openweathermap.org/geo/1.0'

// GET /weather?city=São Paulo
app.get('/weather', async (req, res) => {
  const city = req.query.city?.trim()
  if (!city) return res.status(400).json({ error: 'city is required' })

  const cacheKey = `weather:${city.toLowerCase()}`
  const hit = cached(cacheKey)
  if (hit) return res.json({ ...hit, cached: true })

  try {
    const r = await fetch(
      `${OWM}/weather?q=${encodeURIComponent(city)}&appid=${KEY}&units=metric&lang=pt`
    )
    if (!r.ok) {
      const err = await r.json()
      return res.status(r.status).json({ error: err.message })
    }
    const data = await r.json()
    store(cacheKey, data)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'upstream error' })
  }
})

// GET /forecast?city=São Paulo
app.get('/forecast', async (req, res) => {
  const city = req.query.city?.trim()
  if (!city) return res.status(400).json({ error: 'city is required' })

  const cacheKey = `forecast:${city.toLowerCase()}`
  const hit = cached(cacheKey)
  if (hit) return res.json({ ...hit, cached: true })

  try {
    const r = await fetch(
      `${OWM}/forecast?q=${encodeURIComponent(city)}&appid=${KEY}&units=metric&lang=pt&cnt=40`
    )
    if (!r.ok) {
      const err = await r.json()
      return res.status(r.status).json({ error: err.message })
    }
    const data = await r.json()
    store(cacheKey, data)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'upstream error' })
  }
})

// GET /uv?lat=xx&lon=yy
app.get('/uv', async (req, res) => {
  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' })

  const cacheKey = `uv:${lat}:${lon}`
  const hit = cached(cacheKey)
  if (hit) return res.json({ ...hit, cached: true })

  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${KEY}`
    )
    if (!r.ok) {
      // fallback: UV not available on free tier, return null gracefully
      return res.json({ uvi: null })
    }
    const data = await r.json()
    const result = { uvi: data.current?.uvi ?? null }
    store(cacheKey, result)
    res.json(result)
  } catch {
    res.json({ uvi: null })
  }
})

// GET /search?q=lon  (autocomplete)
app.get('/search', async (req, res) => {
  const q = req.query.q?.trim()
  if (!q || q.length < 2) return res.json([])

  const cacheKey = `search:${q.toLowerCase()}`
  const hit = cached(cacheKey)
  if (hit) return res.json(hit)

  try {
    const r = await fetch(
      `${GEO}/direct?q=${encodeURIComponent(q)}&limit=5&appid=${KEY}`
    )
    const data = await r.json()
    const results = data.map(c => ({
      name:    c.local_names?.pt || c.name,
      country: c.country,
      state:   c.state,
      lat:     c.lat,
      lon:     c.lon,
    }))
    store(cacheKey, results)
    res.json(results)
  } catch {
    res.json([])
  }
})

app.get('/health', (_, res) => res.json({ ok: true, cache: cache.size }))

app.listen(PORT, () => console.log(`✅  Atmos server running on :${PORT}`))
