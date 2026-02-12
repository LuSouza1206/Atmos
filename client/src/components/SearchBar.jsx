import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'
import styles from './SearchBar.module.css'

export function SearchBar({ onSelect }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open,        setOpen]        = useState(false)
  const [idx,         setIdx]         = useState(-1)
  const timer  = useRef(null)
  const ref    = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    setIdx(-1)
    clearTimeout(timer.current)
    if (val.length < 2) { setSuggestions([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      try {
        const results = await api.search(val)
        setSuggestions(results)
        setOpen(results.length > 0)
      } catch {}
    }, 300)
  }

  function handleSelect(s) {
    onSelect(s.name + (s.state ? `, ${s.state}` : '') + `, ${s.country}`)
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  function handleKey(e) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { handleSelect(suggestions[idx]) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.inputRow}>
        <span className={styles.icon}>⌕</span>
        <input
          className={styles.input}
          placeholder="Buscar cidade..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => suggestions.length && setOpen(true)}
        />
      </div>
      {open && (
        <ul className={styles.dropdown}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={`${styles.item} ${i === idx ? styles.active : ''}`}
              onMouseDown={() => handleSelect(s)}
            >
              <span className={styles.itemName}>{s.name}{s.state ? `, ${s.state}` : ''}</span>
              <span className={styles.itemCountry}>{s.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
