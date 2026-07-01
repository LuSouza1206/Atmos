import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css'

export default function Header({ minimal }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'doctor'
      ? '/medico'
      : user?.role === 'patient'
        ? '/paciente'
        : null

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>+</span>
          MedSched
        </Link>

        {!minimal && (
          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>Buscar médicos</Link>
            {user ? (
              <>
                {dashboardPath && (
                  <Link to={dashboardPath} className={styles.navLink}>Meu painel</Link>
                )}
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">Sair</button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>Entrar</Link>
                <Link to="/cadastro" className="btn btn-secondary btn-sm">Cadastrar</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
