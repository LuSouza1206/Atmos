import { Router } from 'express'
import db from '../db.js'
import { authRequired, roleRequired } from '../middleware/auth.js'

const router = Router()

router.use(authRequired, roleRequired('admin'))

// GET /admin/metrics
router.get('/metrics', (_, res) => {
  const totalDoctors = db.prepare('SELECT COUNT(*) as c FROM doctors WHERE active = 1').get().c
  const totalPatients = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'patient'`).get().c
  const scheduled = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'scheduled'`).get().c
  const completed = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'completed'`).get().c
  const cancelled = db.prepare(`SELECT COUNT(*) as c FROM appointments WHERE status = 'cancelled'`).get().c
  const todayAppointments = db.prepare(`
    SELECT COUNT(*) as c FROM appointments WHERE date = date('now') AND status = 'scheduled'
  `).get().c

  const bySpecialty = db.prepare(`
    SELECT d.specialty, COUNT(a.id) as count
    FROM doctors d
    LEFT JOIN appointments a ON a.doctor_id = d.id AND a.status = 'scheduled'
    WHERE d.active = 1
    GROUP BY d.specialty
    ORDER BY count DESC
  `).all()

  res.json({
    totalDoctors,
    totalPatients,
    scheduled,
    completed,
    cancelled,
    todayAppointments,
    bySpecialty,
  })
})

// GET /admin/doctors
router.get('/doctors', (_, res) => {
  const doctors = db.prepare(`
    SELECT d.*, u.name, u.email,
      (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id AND a.status = 'scheduled') as scheduled_count
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    ORDER BY u.name
  `).all()
  res.json(doctors)
})

// PATCH /admin/doctors/:id/toggle
router.patch('/doctors/:id/toggle', (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id)
  if (!doctor) return res.status(404).json({ error: 'Médico não encontrado' })

  const newActive = doctor.active ? 0 : 1
  db.prepare('UPDATE doctors SET active = ? WHERE id = ?').run(newActive, req.params.id)
  res.json({ id: doctor.id, active: !!newActive })
})

export default router
