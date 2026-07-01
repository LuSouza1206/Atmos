import { useState, useEffect } from 'react'
import { api, formatDateLong } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

export default function DoctorDashboard() {
  const { doctor } = useAuth()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [agenda, setAgenda] = useState({ appointments: [] })
  const [newSlots, setNewSlots] = useState([{ date: '', time: '' }])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadAgenda = () => {
    setLoading(true)
    api.doctorAgenda(date)
      .then(setAgenda)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAgenda() }, [date])

  const addSlotRow = () => setNewSlots(s => [...s, { date: '', time: '' }])

  const updateSlot = (i, field, value) => {
    setNewSlots(s => s.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    if (!doctor) return
    const valid = newSlots.filter(s => s.date && s.time)
    if (!valid.length) return
    try {
      await api.addAvailability(doctor.id, valid)
      setMessage('Horários adicionados com sucesso')
      setNewSlots([{ date: '', time: '' }])
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  const times = ['08:00','08:30','09:00','09:30','10:00','10:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Agenda do dia</h1>
          <p className={styles.subtitle}>{doctor?.specialty} · {doctor?.crm}</p>
        </div>
        <input
          type="date"
          className={`input ${styles.dateInput}`}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {message && (
        <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <section className={`card ${styles.section}`}>
        <h2>Consultas — {formatDateLong(date)}</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : agenda.appointments?.length ? (
          <div className={styles.agendaList}>
            {agenda.appointments.map(a => (
              <div key={a.id} className={styles.agendaItem}>
                <span className={styles.agendaTime}>{a.time}</span>
                <div>
                  <strong>{a.patient_name}</strong>
                  <span className={styles.agendaEmail}>{a.patient_email}</span>
                </div>
                {a.notes && <p className={styles.agendaNotes}>{a.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhuma consulta neste dia</h3>
          </div>
        )}
      </section>

      <section className={`card ${styles.section}`}>
        <h2>Gerenciar disponibilidade</h2>
        <p className={styles.hint}>Adicione novos horários disponíveis para agendamento.</p>
        <form onSubmit={handleAddAvailability}>
          {newSlots.map((slot, i) => (
            <div key={i} className={styles.slotFormRow}>
              <input
                type="date"
                className="input"
                value={slot.date}
                onChange={e => updateSlot(i, 'date', e.target.value)}
                required
              />
              <select
                className="input"
                value={slot.time}
                onChange={e => updateSlot(i, 'time', e.target.value)}
                required
              >
                <option value="">Horário</option>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          ))}
          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addSlotRow}>
              + Adicionar linha
            </button>
            <button type="submit" className="btn btn-primary btn-sm">Salvar horários</button>
          </div>
        </form>
      </section>
    </div>
  )
}
