import { Router } from 'express'
import db from '../db.js'
import { authRequired, roleRequired } from '../middleware/auth.js'

const router = Router()

// POST /appointments — book
router.post('/', authRequired, roleRequired('patient'), (req, res) => {
  const { availabilityId, notes } = req.body
  if (!availabilityId) return res.status(400).json({ error: 'Horário é obrigatório' })

  const slot = db.prepare('SELECT * FROM availability WHERE id = ?').get(availabilityId)
  if (!slot) return res.status(404).json({ error: 'Horário não encontrado' })
  if (slot.is_booked) return res.status(409).json({ error: 'Horário indisponível' })

  const book = db.transaction(() => {
    db.prepare('UPDATE availability SET is_booked = 1 WHERE id = ?').run(availabilityId)
    const result = db.prepare(`
      INSERT INTO appointments (doctor_id, patient_id, availability_id, date, time, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(slot.doctor_id, req.user.id, availabilityId, slot.date, slot.time, notes || '')
    return result.lastInsertRowid
  })

  const id = book()
  const appointment = getAppointmentById(id)
  res.status(201).json(appointment)
})

function getAppointmentById(id) {
  return db.prepare(`
    SELECT a.*,
      u.name as patient_name,
      du.name as doctor_name,
      d.specialty, d.photo_url
    FROM appointments a
    JOIN users u ON u.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    WHERE a.id = ?
  `).get(id)
}

// GET /appointments/my — patient appointments
router.get('/my', authRequired, roleRequired('patient'), (req, res) => {
  const { status } = req.query
  let sql = `
    SELECT a.*, du.name as doctor_name, d.specialty, d.photo_url, d.id as doctor_id
    FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    WHERE a.patient_id = ?
  `
  const params = [req.user.id]

  if (status === 'upcoming') {
    sql += ` AND a.status = 'scheduled' AND a.date >= date('now')`
  } else if (status === 'past') {
    sql += ` AND (a.status IN ('completed', 'cancelled') OR a.date < date('now'))`
  }

  sql += ` ORDER BY a.date DESC, a.time DESC`
  res.json(db.prepare(sql).all(...params))
})

// GET /appointments/doctor — doctor agenda
router.get('/doctor', authRequired, roleRequired('doctor'), (req, res) => {
  const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id)
  if (!doctor) return res.status(404).json({ error: 'Perfil médico não encontrado' })

  const { date } = req.query
  const targetDate = date || new Date().toISOString().slice(0, 10)

  const appointments = db.prepare(`
    SELECT a.*, u.name as patient_name, u.email as patient_email
    FROM appointments a
    JOIN users u ON u.id = a.patient_id
    WHERE a.doctor_id = ? AND a.date = ? AND a.status = 'scheduled'
    ORDER BY a.time
  `).all(doctor.id, targetDate)

  res.json({ date: targetDate, appointments })
})

// PATCH /appointments/:id/cancel
router.patch('/:id/cancel', authRequired, (req, res) => {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id)
  if (!appt) return res.status(404).json({ error: 'Consulta não encontrada' })

  const isPatient = req.user.role === 'patient' && appt.patient_id === req.user.id
  const isDoctor = req.user.role === 'doctor' && db.prepare('SELECT id FROM doctors WHERE user_id = ? AND id = ?').get(req.user.id, appt.doctor_id)
  if (!isPatient && !isDoctor && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' })
  }
  if (appt.status !== 'scheduled') {
    return res.status(400).json({ error: 'Consulta não pode ser cancelada' })
  }

  db.transaction(() => {
    db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).run(req.params.id)
    if (appt.availability_id) {
      db.prepare('UPDATE availability SET is_booked = 0 WHERE id = ?').run(appt.availability_id)
    }
  })()

  res.json({ ok: true })
})

// PATCH /appointments/:id/reschedule
router.patch('/:id/reschedule', authRequired, roleRequired('patient'), (req, res) => {
  const { availabilityId } = req.body
  if (!availabilityId) return res.status(400).json({ error: 'Novo horário é obrigatório' })

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND patient_id = ?').get(req.params.id, req.user.id)
  if (!appt) return res.status(404).json({ error: 'Consulta não encontrada' })
  if (appt.status !== 'scheduled') return res.status(400).json({ error: 'Consulta não pode ser reagendada' })

  const newSlot = db.prepare('SELECT * FROM availability WHERE id = ? AND doctor_id = ?').get(availabilityId, appt.doctor_id)
  if (!newSlot) return res.status(404).json({ error: 'Horário não encontrado' })
  if (newSlot.is_booked) return res.status(409).json({ error: 'Horário indisponível' })

  db.transaction(() => {
    if (appt.availability_id) {
      db.prepare('UPDATE availability SET is_booked = 0 WHERE id = ?').run(appt.availability_id)
    }
    db.prepare('UPDATE availability SET is_booked = 1 WHERE id = ?').run(availabilityId)
    db.prepare(`
      UPDATE appointments SET availability_id = ?, date = ?, time = ? WHERE id = ?
    `).run(availabilityId, newSlot.date, newSlot.time, req.params.id)
  })()

  res.json(getAppointmentById(req.params.id))
})

// GET /appointments/:id
router.get('/:id', authRequired, (req, res) => {
  const appt = getAppointmentById(req.params.id)
  if (!appt) return res.status(404).json({ error: 'Consulta não encontrada' })

  const canView =
    req.user.role === 'admin' ||
    appt.patient_id === req.user.id ||
    (req.user.role === 'doctor' && db.prepare('SELECT id FROM doctors WHERE user_id = ? AND id = ?').get(req.user.id, appt.doctor_id))

  if (!canView) return res.status(403).json({ error: 'Acesso negado' })
  res.json(appt)
})

export default router
