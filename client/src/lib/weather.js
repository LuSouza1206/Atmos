export function weatherIcon(code) {
  if (code >= 200 && code < 300) return '⛈️'
  if (code >= 300 && code < 400) return '🌦️'
  if (code >= 500 && code < 600) return '🌧️'
  if (code >= 600 && code < 700) return '❄️'
  if (code >= 700 && code < 800) return '🌫️'
  if (code === 800)               return '☀️'
  if (code === 801)               return '🌤️'
  if (code <= 803)                return '⛅'
  return '☁️'
}

export function uvLabel(uvi) {
  if (uvi == null) return { label: '—', color: 'var(--ink-dim)' }
  if (uvi <= 2)  return { label: 'Baixo',     color: '#4ade80' }
  if (uvi <= 5)  return { label: 'Moderado',  color: '#fbbf24' }
  if (uvi <= 7)  return { label: 'Alto',      color: '#fb923c' }
  if (uvi <= 10) return { label: 'Muito alto', color: '#f87171' }
  return             { label: 'Extremo',    color: '#e879f9' }
}

export function uvPct(uvi) {
  if (uvi == null) return 0
  return Math.min((uvi / 11) * 100, 100)
}

export function windDir(deg) {
  const dirs = ['N','NE','L','SE','S','SO','O','NO']
  return dirs[Math.round(deg / 45) % 8]
}

const DAY = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export function dayLabel(dt) {
  return DAY[new Date(dt * 1000).getDay()]
}

// Group 3h forecast into daily max/min
export function groupForecast(list) {
  const days = {}
  list.forEach(item => {
    const date = new Date(item.dt * 1000)
    const key  = date.toDateString()
    if (!days[key]) days[key] = { dt: item.dt, items: [] }
    days[key].items.push(item)
  })

  return Object.values(days).slice(0, 5).map(d => {
    const temps = d.items.map(i => i.main.temp)
    const mid   = d.items[Math.floor(d.items.length / 2)]
    return {
      dt:        d.dt,
      day:       dayLabel(d.dt),
      icon:      weatherIcon(mid.weather[0].id),
      desc:      mid.weather[0].description,
      hi:        Math.round(Math.max(...temps)),
      lo:        Math.round(Math.min(...temps)),
    }
  })
}
