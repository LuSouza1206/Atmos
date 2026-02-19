import { useState, useEffect, useRef } from 'react'
import { SearchBar }    from './components/SearchBar'
import { SavedCities }  from './components/SavedCities'
import { useWeather }   from './hooks/useWeather'
import { weatherIcon }  from './lib/weather'
import { TempGraph }    from './components/TempGraph'
import styles from './App.module.css'

const DEFAULT_CITY = 'São Paulo'

const BG = {
  clear:        'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=90',
  partlyCloudy: 'https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=1920&q=90',
  clouds:       'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=90',
  rain:         'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=90',
  snow:         'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=90',
  storm:        'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=90',
  mist:         'https://images.unsplash.com/photo-1483977399921-6cf94c6de5c6?w=1920&q=90',
}

function getBg(code) {
  if (!code) return 'clear'
  if (code >= 200 && code < 300) return 'storm'
  if (code >= 300 && code < 600) return 'rain'
  if (code >= 600 && code < 700) return 'snow'
  if (code >= 700 && code < 800) return 'mist'
  if (code === 800)               return 'clear'
  if (code <= 802)                return 'partlyCloudy'
  return 'clouds'
}

function fmtDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export default function App() {
  const [city,  setCity]  = useState(DEFAULT_CITY)
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('atmos_saved') || '[]'))
  const [sideOpen, setSideOpen] = useState(false)

  const { data, loading, error } = useWeather(city)

  useEffect(() => {
    localStorage.setItem('atmos_saved', JSON.stringify(saved))
  }, [saved])

  function toggleSave() {
    setSaved(s => s.includes(city) ? s.filter(c => c !== city) : [...s, city])
  }

  function handleSelect(c) {
    setCity(c)
    setSideOpen(false)
  }

  const bgKey = getBg(data?.code)
  const isSaved = saved.includes(city)

  return (
    <div className={styles.root}>
      {/* Background */}
      <div className={styles.bg} style={{ backgroundImage: `url('${BG[bgKey]}')` }} />
      <div className={styles.bgOverlay} />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sideOpen ? styles.sideOpen : ''}`}>
        <div className={styles.sideHeader}>
          <span className={styles.brand}>Atmos</span>
          <button className={styles.closeBtn} onClick={() => setSideOpen(false)}>✕</button>
        </div>
        <SearchBar onSelect={handleSelect} />
        <div className={styles.savedWrap}>
          <span className={styles.savedTitle}>Recentes</span>
          <SavedCities
            cities={saved}
            current={city}
            onSelect={handleSelect}
            onRemove={c => setSaved(s => s.filter(x => x !== c))}
          />
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.locationRow}>
            <span className={styles.locationPin}>⊙</span>
            <span className={styles.locationName}>{data?.name ?? '—'}, {data?.country}</span>
            <span className={styles.locationDate}>{fmtDate()}</span>
          </div>
          <div className={styles.topActions}>
            <button
              className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
              onClick={toggleSave}
            >
              {isSaved ? '★' : '☆'}
            </button>
            <button className={styles.searchToggle} onClick={() => setSideOpen(o => !o)}>
              ⌕
            </button>
          </div>
        </div>

        {/* Center hero */}
        <div className={styles.hero}>
          {loading && <p className={styles.loadingText}>Carregando...</p>}
          {error && <p className={styles.errorText}>Cidade não encontrada.</p>}
          {data && !loading && (
            <>
              <div className={styles.heroTop}>
                <div className={styles.tempBlock}>
                  <span className={styles.tempValue}>{data.temp}°</span>
                  <div className={styles.tempMeta}>
                    <span className={styles.hiLo}>
                      ↑ {data.forecast[0]?.hi ?? '—'}° &nbsp; ↓ {data.forecast[0]?.lo ?? '—'}°
                    </span>
                    <span className={styles.feels}>Sensação {data.feels}°</span>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statL}>Umidade</span>
                    <span className={styles.statV}>{data.humidity}%</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statL}>Vento</span>
                    <span className={styles.statV}>{data.wind} km/h</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statL}>Visib.</span>
                    <span className={styles.statV}>{data.visibility} km</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statL}>Pressão</span>
                    <span className={styles.statV}>{data.pressure} hPa</span>
                  </div>
                </div>
              </div>

              <div className={styles.conditionRow}>
                <h1 className={styles.condition}>{data.condition}</h1>
                <span className={styles.condIcon}>{weatherIcon(data.code)}</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom graph */}
        {data && !loading && (
          <div className={styles.bottom}>
            <TempGraph forecast={data.forecast} hourly={data.hourly} />
          </div>
        )}
      </div>
    </div>
  )
}