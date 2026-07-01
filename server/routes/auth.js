import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken, authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/register', (req, res) => {
  const { email, password, name, role, specialty, crm } = req.body

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, senha, nome, perfil' })
  }
  if (!['patient', 'doctor'].includes(role)) {
    return res.status(400).json({ error: 'Perfil deve ser patient ou doctor' })
  }
  if (role === 'doctor' && (!specialty || !crm)) {
    return res.status(400).json({ error: 'Médicos devem informar especialidade e CRM' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email já cadastrado' })

  const hash = bcrypt.hashSync(password, 10)
  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
  )
  const result = insertUser.run(email, hash, name, role)
  const userId = result.lastInsertRowid

  if (role === 'doctor') {
    db.prepare(
      'INSERT INTO doctors (user_id, specialty, crm, bio) VALUES (?, ?, ?, ?)'
    ).run(userId, specialty, crm, `Dr(a). ${name} — ${specialty}`)
  }

  const user = { id: userId, email, name, role }
  res.status(201).json({ token: signToken(user), user })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos' })
  }

  const { password_hash, ...safe } = user
  res.json({ token: signToken(safe), user: safe })
})

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  let doctor = null
  if (user.role === 'doctor') {
    doctor = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id)
  }

  res.json({ user, doctor })
})

export default router
