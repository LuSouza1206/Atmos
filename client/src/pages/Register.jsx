import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Register() {
  const [role, setRole] = useState('patient')
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: '', crm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, role }
      if (role === 'patient') {
        delete payload.specialty
        delete payload.crm
      }
      const user = await register(payload)
      navigate(user.role === 'doctor' ? '/medico' : '/paciente')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header minimal />
      <div className={styles.page}>
        <div className={`card ${styles.card}`}>
          <h1>Criar conta</h1>
          <p className={styles.subtitle}>Escolha seu perfil e comece a usar</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'patient' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('patient')}
            >
              <span className={styles.roleIcon}>👤</span>
              Sou paciente
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${role === 'doctor' ? styles.roleBtnActive : ''}`}
              onClick={() => setRole('doctor')}
            >
              <span className={styles.roleIcon}>🩺</span>
              Sou médico
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="name">Nome completo</label>
              <input id="name" className="input" value={form.name} onChange={update('name')} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={form.email} onChange={update('email')} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">Senha</label>
              <input id="password" type="password" className="input" value={form.password} onChange={update('password')} required minLength={6} />
            </div>

            {role === 'doctor' && (
              <>
                <div className="form-group">
                  <label className="label" htmlFor="specialty">Especialidade</label>
                  <input id="specialty" className="input" value={form.specialty} onChange={update('specialty')} required placeholder="Ex: Cardiologia" />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="crm">CRM</label>
                  <input id="crm" className="input" value={form.crm} onChange={update('crm')} required placeholder="Ex: CRM-SP 123456" />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar conta'}
            </button>
          </form>

          <p className={styles.footer}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </>
  )
}
