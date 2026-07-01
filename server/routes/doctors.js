import { Router } from 'express'
import db from '../db.js'
import { authRequired, roleRequired } from '../middleware/auth.js'

const router = Router()

function doctorRow(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    specialty: row.specialty,
    bio: row.bio,
    crm: row.crm,
    gender: row.gender,
    languages: row.languages?.split(',') || [],
    insurance: row.insurance?.split(',') || [],
    rating: row.rating,
    reviewCount: row.review_count,
    photoUrl: row.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.name)}&backgroundColor=2563eb`,
    nextAvailable: row.next_date && row.next_time
      ? { date: row.next_date, time: row.next_time }
      : null,
  }
}

// GET /doctors?q=&specialty=&insurance=&gender=
router.get('/', (req, res) => {
  const { q, specialty, insurance, gender } = req.query
  let sql = `
    SELECT d.*, u.name, u.email,
      (SELECT a.date FROM availability a
       WHERE a.doctor_id = d.id AND a.is_booked = 0 AND a.date >= date('now')
       ORDER BY a.date, a.time LIMIT 1) as next_date,
      (SELECT a.time FROM availability a
       WHERE a.doctor_id = d.id AND a.is_booked = 0 AND a.date >= date('now')
       ORDER BY a.date, a.time LIMIT 1) as next_time
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    WHERE d.active = 1
  `
  const params = []

  if (q) {
    sql += ` AND (u.name LIKE ? OR d.specialty LIKE ? OR d.bio LIKE ?)`
    const term = `%${q}%`
    params.push(term, term, term)
  }
  if (specialty) {
    sql += ` AND d.specialty = ?`
    params.push(specialty)
  }
  if (gender) {
    sql += ` AND d.gender = ?`
    params.push(gender)
  }
  if (insurance) {
    sql += ` AND d.insurance LIKE ?`
    params.push(`%${insurance}%`)
  }

  sql += ` ORDER BY d.rating DESC, u.name ASC`
  const rows = db.prepare(sql).all(...params)
  res.json(rows.map(doctorRow))
})

router.get('/specialties', (_, res) => {
  const rows = db.prepare('SELECT DISTINCT specialty FROM doctors WHERE active = 1 ORDER BY specialty').all()
  res.json(rows.map(r => r.specialty))
})

// GET /doctors/:id
router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT d.*, u.name, u.email,
      (SELECT a.date FROM availability a
       WHERE a.doctor_id = d.id AND a.is_booked = 0 AND a.date >= date('now')
       ORDER BY a.date, a.time LIMIT 1) as next_date,
      (SELECT a.time FROM availability a
       WHERE a.doctor_id = d.id AND a.is_booked = 0 AND a.date >= date('now')
       ORDER BY a.date, a.time LIMIT 1) as next_time
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    WHERE d.id = ?
  `).get(req.params.id)

  if (!row) return res.status(404).json({ error: 'Médico não encontrado' })

  const reviews = db.prepare(`
    SELECT r.*, u.name as patient_name
    FROM reviews r
    JOIN users u ON u.id = r.patient_id
    WHERE r.doctor_id = ?
    ORDER BY r.created_at DESC
    LIMIT 10
  `).all(req.params.id)

  res.json({ ...doctorRow(row), reviews })
})

// GET /doctors/:id/availability?from=&to=
router.get('/:id/availability', (req, res) => {
  const from = req.query.from || new Date().toISOString().slice(0, 10)
  const to = req.query.to || (() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })()

  const slots = db.prepare(`
    SELECT id, date, time, is_booked
    FROM availability
    WHERE doctor_id = ? AND date >= ? AND date <= ?
    ORDER BY date, time
  `).all(req.params.id, from, to)

  const grouped = {}
  for (const s of slots) {
    if (!grouped[s.date]) grouped[s.date] = []
    grouped[s.date].push({ id: s.id, time: s.time, available: !s.is_booked })
  }

  res.json(grouped)
})

// POST /doctors/:id/availability — doctor only
router.post('/:id/availability', authRequired, roleRequired('doctor'), (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!doctor) return res.status(403).json({ error: 'Acesso negado' })

  const { slots } = req.body
  if (!Array.isArray(slots) || !slots.length) {
    return res.status(400).json({ error: 'Informe ao menos um horário' })
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO availability (doctor_id, date, time) VALUES (?, ?, ?)
  `)

  const tx = db.transaction(() => {
    for (const { date, time } of slots) {
      insert.run(req.params.id, date, time)
    }
  })
  tx()

  res.status(201).json({ ok: true })
})

// DELETE /doctors/:id/availability/:slotId
router.delete('/:id/availability/:slotId', authRequired, roleRequired('doctor'), (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!doctor) return res.status(403).json({ error: 'Acesso negado' })

  const slot = db.prepare('SELECT * FROM availability WHERE id = ? AND doctor_id = ?').get(req.params.slotId, req.params.id)
  if (!slot) return res.status(404).json({ error: 'Horário não encontrado' })
  if (slot.is_booked) return res.status(400).json({ error: 'Horário já reservado' })

  db.prepare('DELETE FROM availability WHERE id = ?').run(req.params.slotId)
  res.json({ ok: true })
})

export default router
