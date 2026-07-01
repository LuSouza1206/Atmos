import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, formatDateLong } from '../lib/api'
import TimeSlotGrid from '../components/TimeSlotGrid'
import styles from './Dashboard.module.css'

export default function PatientDashboard() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [rescheduleId, setRescheduleId] = useState(null)
  const [availability, setAvailability] = useState({})
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.myAppointments('upcoming'),
      api.myAppointments('past'),
    ])
      .then(([up, pa]) => {
        setUpcoming(up)
        setPast(pa)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Deseja cancelar esta consulta?')) return
    try {
      await api.cancelAppointment(id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const startReschedule = async (appt) => {
    setRescheduleId(appt.id)
    setSelectedSlot(null)
    setActionError('')
    const avail = await api.getAvailability(appt.doctor_id)
    setAvailability(avail)
  }

  const confirmReschedule = async () => {
    if (!selectedSlot) return
    try {
      await api.rescheduleAppointment(rescheduleId, selectedSlot)
      setRescheduleId(null)
      load()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const AppointmentRow = ({ appt, showActions }) => (
    <div className={styles.apptCard}>
      <img
        src={appt.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${appt.doctor_name}`}
        alt=""
        className={styles.apptPhoto}
      />
      <div className={styles.apptInfo}>
        <strong>{appt.doctor_name}</strong>
        <span className={styles.apptSpecialty}>{appt.specialty}</span>
        <span className={styles.apptDate}>
          {formatDateLong(appt.date)} às {appt.time}
        </span>
        <span className={`badge ${
          appt.status === 'scheduled' ? 'badge-success' :
          appt.status === 'cancelled' ? 'badge-danger' : 'badge-neutral'
        }`}>
          {appt.status === 'scheduled' ? 'Agendada' :
           appt.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
        </span>
      </div>
      {showActions && appt.status === 'scheduled' && (
        <div className={styles.apptActions}>
          <button className="btn btn-outline btn-sm" onClick={() => startReschedule(appt)}>
            Reagendar
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(appt.id)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Minhas consultas</h1>
          <p className={styles.subtitle}>Gerencie seus agendamentos</p>
        </div>
        <Link to="/" className="btn btn-primary">Agendar nova consulta</Link>
      </div>

      {rescheduleId && (
        <div className={`card ${styles.reschedulePanel}`}>
          <h2>Reagendar consulta</h2>
          {actionError && <div className="alert alert-error">{actionError}</div>}
          <TimeSlotGrid
            availability={availability}
            selectedId={selectedSlot}
            onSelect={(id) => setSelectedSlot(id)}
          />
          <div className={styles.actions}>
            <button className="btn btn-outline btn-sm" onClick={() => setRescheduleId(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={!selectedSlot} onClick={confirmReschedule}>
              Confirmar novo horário
            </button>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <h2>Próximas consultas</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : upcoming.length ? (
          <div className={styles.apptList}>
            {upcoming.map(a => <AppointmentRow key={a.id} appt={a} showActions />)}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma consulta agendada</h3>
            <p>Busque um médico e agende sua primeira consulta.</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>Histórico</h2>
        {past.length ? (
          <div className={styles.apptList}>
            {past.map(a => <AppointmentRow key={a.id} appt={a} />)}
          </div>
        ) : (
          <p className={styles.empty}>Nenhuma consulta no histórico.</p>
        )}
      </section>
    </div>
  )
}
