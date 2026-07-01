import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Layout/Header'
import TimeSlotGrid from '../components/TimeSlotGrid'
import { api, formatDateLong } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styles from './Booking.module.css'

export default function Booking() {
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState({})
  const [selectedId, setSelectedId] = useState(searchParams.get('slot') || null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  useEffect(() => {
    Promise.all([api.getDoctor(doctorId), api.getAvailability(doctorId)])
      .then(([doc, avail]) => {
        setDoctor(doc)
        setAvailability(avail)
        const slotId = searchParams.get('slot')
        if (slotId) {
          for (const [date, slots] of Object.entries(avail)) {
            const slot = slots.find(s => String(s.id) === slotId && s.available)
            if (slot) {
              setSelectedId(slot.id)
              setSelectedDate(date)
              setSelectedTime(slot.time)
              break
            }
          }
        }
      })
      .finally(() => setLoading(false))
  }, [doctorId, searchParams])

  const handleSelect = (id, date, time) => {
    setSelectedId(id)
    setSelectedDate(date)
    setSelectedTime(time)
    setError('')
  }

  const handleConfirm = async () => {
    if (!selectedId) {
      setError('Selecione um horário')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const appt = await api.book({ availabilityId: Number(selectedId), notes })
      setConfirmed(appt)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="container" style={{ padding: 48 }}>Carregando...</div>
      </>
    )
  }

  if (step === 3 && confirmed) {
    return (
      <>
        <Header />
        <div className={`container ${styles.page}`}>
          <div className={`card ${styles.confirmCard}`}>
            <div className={styles.confirmIcon}>✓</div>
            <h1>Consulta confirmada!</h1>
            <p className={styles.confirmText}>
              Sua consulta com <strong>{confirmed.doctor_name}</strong> foi agendada para{' '}
              <strong>{formatDateLong(confirmed.date)}</strong> às <strong>{confirmed.time}</strong>.
            </p>
            <div className={styles.confirmActions}>
              <Link to="/paciente" className="btn btn-primary">Ver minhas consultas</Link>
              <Link to="/" className="btn btn-outline">Voltar à busca</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={`container ${styles.page}`}>
        <div className={styles.steps}>
          <span className={step >= 1 ? styles.stepActive : ''}>1. Horário</span>
          <span className={styles.stepDivider}>→</span>
          <span className={step >= 2 ? styles.stepActive : ''}>2. Confirmação</span>
        </div>

        <div className={styles.layout}>
          <aside className={`card ${styles.sidebar}`}>
            {doctor && (
              <>
                <img src={doctor.photoUrl} alt={doctor.name} className={styles.photo} />
                <h2>{doctor.name}</h2>
                <p className={styles.specialty}>{doctor.specialty}</p>
              </>
            )}
          </aside>

          <main className={styles.main}>
            {step === 1 && (
              <>
                <h1>Escolha o horário</h1>
                <p className={styles.hint}>Selecione um horário disponível no calendário abaixo.</p>
                <TimeSlotGrid
                  availability={availability}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                />
                <div className={styles.actions}>
                  <Link to={`/medico/${doctorId}`} className="btn btn-outline">Voltar</Link>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedId}
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1>Confirmar agendamento</h1>
                <div className={`card ${styles.summary}`}>
                  <div className={styles.summaryRow}>
                    <span>Data</span>
                    <strong>{formatDateLong(selectedDate)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Horário</span>
                    <strong>{selectedTime}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Médico</span>
                    <strong>{doctor?.name}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="notes">Observações (opcional)</label>
                  <textarea
                    id="notes"
                    className="input"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Descreva sintomas ou informações relevantes..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className={styles.actions}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>Voltar</button>
                  <button className="btn btn-primary btn-lg" onClick={handleConfirm} disabled={submitting}>
                    {submitting ? 'Confirmando...' : 'Confirmar consulta'}
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
