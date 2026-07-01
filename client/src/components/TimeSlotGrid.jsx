import { formatDate } from '../lib/api'
import styles from './TimeSlotGrid.module.css'

export default function TimeSlotGrid({ availability, selectedId, onSelect }) {
  const dates = Object.keys(availability).sort()

  if (!dates.length) {
    return (
      <div className="empty-state">
        <h3>Nenhum horário disponível</h3>
        <p>Tente outro período ou volte mais tarde.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {dates.map(date => (
        <div key={date} className={styles.dayGroup}>
          <h4 className={styles.dayTitle}>{formatDate(date)}</h4>
          <div className={styles.slots}>
            {availability[date].map(slot => (
              <button
                key={slot.id}
                type="button"
                disabled={!slot.available}
                className={`${styles.slot} ${
                  !slot.available ? styles.slotBusy :
                  selectedId === slot.id ? styles.slotSelected : styles.slotAvailable
                }`}
                onClick={() => slot.available && onSelect(slot.id, date, slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
