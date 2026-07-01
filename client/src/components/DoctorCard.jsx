import { Link } from 'react-router-dom'
import { formatDate, starRating } from '../lib/api'
import styles from './DoctorCard.module.css'

export default function DoctorCard({ doctor }) {
  return (
    <Link to={`/medico/${doctor.id}`} className={styles.card}>
      <img
        src={doctor.photoUrl}
        alt={doctor.name}
        className={styles.photo}
      />
      <div className={styles.info}>
        <h3 className={styles.name}>{doctor.name}</h3>
        <p className={styles.specialty}>{doctor.specialty}</p>
        <div className={styles.rating}>
          <span className="stars">{starRating(doctor.rating)}</span>
          <span className={styles.ratingText}>
            {doctor.rating.toFixed(1)} ({doctor.reviewCount} avaliações)
          </span>
        </div>
        {doctor.nextAvailable ? (
          <div className={styles.nextSlot}>
            <span className={styles.nextLabel}>Próxima disponível</span>
            <span className={styles.nextDate}>
              {formatDate(doctor.nextAvailable.date)} às {doctor.nextAvailable.time}
            </span>
          </div>
        ) : (
          <span className={styles.noSlot}>Sem horários disponíveis</span>
        )}
      </div>
      <div className={styles.action}>
        <span className="btn btn-primary btn-sm">Agendar</span>
      </div>
    </Link>
  )
}
