import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      const path = user.role === 'admin' ? '/admin'
        : user.role === 'doctor' ? '/medico'
        : '/paciente'
      navigate(path)
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
          <h1>Entrar</h1>
          <p className={styles.subtitle}>Acesse sua conta MedSched</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className={styles.footer}>
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>

          <div className={styles.demo}>
            <p>Contas demo (senha: 123456):</p>
            <ul>
              <li>maria@email.com — Paciente</li>
              <li>ana@medsched.com — Médica</li>
              <li>admin@medsched.com — Admin</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
