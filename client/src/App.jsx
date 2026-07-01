import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './components/Layout/DashboardLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorProfile from './pages/DoctorProfile'
import Booking from './pages/Booking'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

const patientLinks = [
  { to: '/paciente', label: 'Minhas consultas', icon: '📅', end: true },
  { to: '/', label: 'Buscar médicos', icon: '🔍' },
]

const doctorLinks = [
  { to: '/medico', label: 'Agenda', icon: '📋', end: true },
  { to: '/', label: 'Buscar médicos', icon: '🔍' },
]

const adminLinks = [
  { to: '/admin', label: 'Métricas', icon: '📊', end: true },
  { to: '/', label: 'Buscar médicos', icon: '🔍' },
]

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/medico/:id" element={<DoctorProfile />} />
        <Route path="/agendar/:doctorId" element={<Booking />} />

        <Route
          path="/paciente"
          element={
            <ProtectedRoute roles={['patient']}>
              <DashboardLayout role="Paciente" links={patientLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
        </Route>

        <Route
          path="/medico"
          element={
            <ProtectedRoute roles={['doctor']}>
              <DashboardLayout role="Médico" links={doctorLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout role="Administrador" links={adminLinks} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
