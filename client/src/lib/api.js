const BASE = '/api'

async function get(path, params = {}) {
  const url = new URL(path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  weather:  city         => get(`${BASE}/weather`,  { city }),
  forecast: city         => get(`${BASE}/forecast`, { city }),
  uv:       (lat, lon)   => get(`${BASE}/uv`,       { lat, lon }),
  search:   q            => get(`${BASE}/search`,   { q }),
}
