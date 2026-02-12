import styles from './SavedCities.module.css'

export function SavedCities({ cities, current, onSelect, onRemove }) {
  if (!cities.length) return (
    <p className={styles.empty}>Nenhuma cidade salva.<br/>Clique em ★ para salvar.</p>
  )

  return (
    <ul className={styles.list}>
      {cities.map(city => (
        <li
          key={city}
          className={`${styles.item} ${city === current ? styles.active : ''}`}
        >
          <button className={styles.name} onClick={() => onSelect(city)}>
            {city}
          </button>
          <button
            className={styles.remove}
            onClick={() => onRemove(city)}
            aria-label={`Remover ${city}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
