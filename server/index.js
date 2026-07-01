import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import './db.js'
import authRoutes from './routes/auth.js'
import doctorRoutes from './routes/doctors.js'
import appointmentRoutes from './routes/appointments.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ ok: true, service: 'MedSched API' }))

app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => console.log(`✅  MedSched server running on :${PORT}`))
