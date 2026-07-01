import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import TimeSlotGrid from '../components/TimeSlotGrid'
import { api, formatDateLong, starRating } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styles from './DoctorProfile.module.css'

export default function DoctorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getDoctor(id), api.getAvailability(id)])
      .then(([doc, avail]) => {
        setDoctor(doc)
        setAvailability(avail)
      })
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/agendar/${id}`)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: '48px 24px' }}>
          <p>Carregando...</p>
        </div>
      </>
    )
  }

  if (!doctor) {
    return (
      <>
        <Header />
        <div className="empty-state">
          <h3>Médico não encontrado</h3>
          <Link to="/">Voltar à busca</Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={`container ${styles.page}`}>
        <Link to="/" className={styles.back}>← Voltar à busca</Link>

        <div className={styles.profileHeader}>
          <img src={doctor.photoUrl} alt={doctor.name} className={styles.photo} />
          <div className={styles.profileInfo}>
            <h1>{doctor.name}</h1>
            <p className={styles.specialty}>{doctor.specialty}</p>
            <p className={styles.crm}>{doctor.crm}</p>
            <div className={styles.rating}>
              <span className="stars">{starRating(doctor.rating)}</span>
              <span>{doctor.rating.toFixed(1)} · {doctor.reviewCount} avaliações</span>
            </div>
            <div className={styles.tags}>
              {doctor.languages.map(l => (
                <span key={l} className="badge badge-neutral">{l}</span>
              ))}
            </div>
            <button onClick={handleBook} className="btn btn-primary btn-lg">
              Agendar consulta
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={`card ${styles.section}`}>
            <h2>Sobre</h2>
            <p className={styles.bio}>{doctor.bio}</p>
            <h3 className={styles.subheading}>Convênios aceitos</h3>
            <div className={styles.tags}>
              {doctor.insurance.map(i => (
                <span key={i} className="badge badge-neutral">{i}</span>
              ))}
            </div>
          </section>

          <section className={`card ${styles.section}`}>
            <h2>Avaliações</h2>
            {doctor.reviews?.length ? (
              <div className={styles.reviews}>
                {doctor.reviews.map(r => (
                  <div key={r.id} className={styles.review}>
                    <div className={styles.reviewHeader}>
                      <strong>{r.patient_name}</strong>
                      <span className="stars">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noReviews}>Nenhuma avaliação ainda.</p>
            )}
          </section>

          <section className={styles.sectionFull}>
            <h2>Disponibilidade</h2>
            <p className={styles.availHint}>
              {doctor.nextAvailable
                ? `Próximo horário: ${formatDateLong(doctor.nextAvailable.date)} às ${doctor.nextAvailable.time}`
                : 'Sem horários disponíveis no momento'}
            </p>
            <TimeSlotGrid
              availability={availability}
              onSelect={(slotId) => {
                if (!user) { navigate('/login'); return }
                navigate(`/agendar/${id}?slot=${slotId}`)
              }}
            />
          </section>
        </div>
      </div>
    </>
  )
}
