import styles from './TempGraph.module.css'

export function TempGraph({ forecast }) {
  const items = forecast.slice(0, 6)
  const temps = items.map(d => d.hi)
  const min   = Math.min(...temps) - 3
  const max   = Math.max(...temps) + 3
  const W = 1200, H = 100, pad = 100

  const x = i => pad + (i / (items.length - 1)) * (W - pad * 2)
  const y = t => H - 16 - ((t - min) / (max - min)) * (H - 40)

  const points = items.map((d, i) => ({ x: x(i), y: y(d.hi), d }))

  const smooth = points.map((p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = arr[i - 1]
    const cpx  = (prev.x + p.x) / 2
    return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`
  }).join(' ')

  const todayIdx = 0

  return (
    <div className={styles.wrapper}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={styles.svg}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.15)" />
            <stop offset="30%"  stopColor="rgba(255,255,255,0.85)" />
            <stop offset="70%"  stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* glow line */}
        <path d={smooth} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        {/* main line */}
        <path d={smooth} fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" />

        {/* temp labels above dots */}
        {points.map((p, i) => (
          <text
            key={`t${i}`}
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="13"
            fontFamily="'DM Mono', monospace"
          >
            {p.d.hi}°
          </text>
        ))}

        {/* dots */}
        {points.map((p, i) => (
          <g key={i}>
            {i === todayIdx && (
              <circle cx={p.x} cy={p.y} r="6" fill="white" opacity="0.15" />
            )}
            <circle
              cx={p.x} cy={p.y} r={i === todayIdx ? 4 : 3}
              fill={i === todayIdx ? 'white' : 'rgba(255,255,255,0.5)'}
              filter={i === todayIdx ? 'url(#glow)' : ''}
            />
          </g>
        ))}
      </svg>

      <div className={styles.labels}>
        {items.map((d, i) => (
          <div key={i} className={`${styles.label} ${i === 0 ? styles.today : ''}`}>
            <span className={styles.labelDay}>{i === 0 ? 'Hoje' : d.day}</span>
            <span className={styles.labelIcon}>{d.icon}</span>
            <span className={styles.labelLo}>{d.lo}°</span>
          </div>
        ))}
      </div>
    </div>
  )
}