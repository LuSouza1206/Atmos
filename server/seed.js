import bcrypt from 'bcryptjs'
import db from './db.js'

const hash = bcrypt.hashSync('123456', 10)

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function clearAll() {
  db.exec(`
    DELETE FROM appointments;
    DELETE FROM availability;
    DELETE FROM reviews;
    DELETE FROM doctors;
    DELETE FROM users;
  `)
}

function seed() {
  clearAll()

  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
  )

  // Admin
  insertUser.run('admin@medsched.com', hash, 'Admin Sistema', 'admin')

  // Doctors
  const doctors = [
    { name: 'Dra. Ana Silva', email: 'ana@medsched.com', specialty: 'Cardiologia', crm: 'CRM-SP 123456', gender: 'female', rating: 4.9, reviews: 128 },
    { name: 'Dr. Carlos Mendes', email: 'carlos@medsched.com', specialty: 'Dermatologia', crm: 'CRM-RJ 234567', gender: 'male', rating: 4.7, reviews: 95 },
    { name: 'Dra. Fernanda Costa', email: 'fernanda@medsched.com', specialty: 'Pediatria', crm: 'CRM-MG 345678', gender: 'female', rating: 4.8, reviews: 210 },
    { name: 'Dr. Roberto Alves', email: 'roberto@medsched.com', specialty: 'Ortopedia', crm: 'CRM-SP 456789', gender: 'male', rating: 4.6, reviews: 67 },
    { name: 'Dra. Juliana Rocha', email: 'juliana@medsched.com', specialty: 'Ginecologia', crm: 'CRM-RS 567890', gender: 'female', rating: 4.9, reviews: 156 },
    { name: 'Dr. Paulo Ferreira', email: 'paulo@medsched.com', specialty: 'Psiquiatria', crm: 'CRM-BA 678901', gender: 'male', rating: 4.5, reviews: 43 },
  ]

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (user_id, specialty, crm, gender, rating, review_count, bio, languages, insurance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const doctorIds = []
  for (const doc of doctors) {
    const { lastInsertRowid: userId } = insertUser.run(doc.email, hash, doc.name, 'doctor')
    const { lastInsertRowid: doctorId } = insertDoctor.run(
      userId,
      doc.specialty,
      doc.crm,
      doc.gender,
      doc.rating,
      doc.reviews,
      `${doc.name} é especialista em ${doc.specialty.toLowerCase()} com mais de 10 anos de experiência. Atendimento humanizado e focado no paciente.`,
      'Português,Inglês',
      'Particular,Unimed,Bradesco Saúde,SulAmérica,Amil'
    )
    doctorIds.push(doctorId)
  }

  // Patients
  const patients = [
    { name: 'Maria Santos', email: 'maria@email.com' },
    { name: 'João Oliveira', email: 'joao@email.com' },
  ]
  const patientIds = []
  for (const p of patients) {
    const { lastInsertRowid } = insertUser.run(p.email, hash, p.name, 'patient')
    patientIds.push(lastInsertRowid)
  }

  // Availability slots
  const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
  const insertSlot = db.prepare('INSERT INTO availability (doctor_id, date, time) VALUES (?, ?, ?)')

  for (const doctorId of doctorIds) {
    for (let day = 1; day <= 14; day++) {
      if (day % 7 === 0) continue // skip Sundays
      const date = addDays(day)
      const dayTimes = times.filter((_, i) => (doctorId + day + i) % 3 !== 0)
      for (const time of dayTimes) {
        insertSlot.run(doctorId, date, time)
      }
    }
  }

  // Sample reviews
  db.prepare(`
    INSERT INTO reviews (doctor_id, patient_id, rating, comment) VALUES (?, ?, ?, ?)
  `).run(doctorIds[0], patientIds[0], 5, 'Excelente atendimento, muito atenciosa e profissional.')

  db.prepare(`
    INSERT INTO reviews (doctor_id, patient_id, rating, comment) VALUES (?, ?, ?, ?)
  `).run(doctorIds[0], patientIds[1], 5, 'Consulta pontual e esclarecedora.')

  console.log('✅  Seed concluído')
  console.log('   Admin: admin@medsched.com / 123456')
  console.log('   Paciente: maria@email.com / 123456')
  console.log('   Médico: ana@medsched.com / 123456')
}

seed()
