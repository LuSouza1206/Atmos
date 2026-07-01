import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import styles from './Dashboard.module.css'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([api.adminMetrics(), api.adminDoctors()])
      .then(([m, d]) => {
        setMetrics(m)
        setDoctors(d)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleDoctor = async (id) => {
    try {
      await api.toggleDoctor(id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1>Painel administrativo</h1>
          <p className={styles.subtitle}>Visão geral do sistema</p>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={`card ${styles.metricCard}`}>
          <span className={styles.metricValue}>{metrics.totalDoctors}</span>
          <span className={styles.metricLabel}>Médicos ativos</span>
        </div>
        <div className={`card ${styles.metricCard}`}>
          <span className={styles.metricValue}>{metrics.totalPatients}</span>
          <span className={styles.metricLabel}>Pacientes</span>
        </div>
        <div className={`card ${styles.metricCard}`}>
          <span className={styles.metricValue}>{metrics.scheduled}</span>
          <span className={styles.metricLabel}>Consultas agendadas</span>
        </div>
        <div className={`card ${styles.metricCard}`}>
          <span className={styles.metricValue}>{metrics.todayAppointments}</span>
          <span className={styles.metricLabel}>Consultas hoje</span>
        </div>
      </div>

      <section className={`card ${styles.section}`}>
        <h2>Consultas por especialidade</h2>
        <div className={styles.specialtyBars}>
          {metrics.bySpecialty.map(s => (
            <div key={s.specialty} className={styles.barRow}>
              <span className={styles.barLabel}>{s.specialty}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${Math.min(100, (s.count / (metrics.scheduled || 1)) * 100)}%` }}
                />
              </div>
              <span className={styles.barCount}>{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`card ${styles.section}`}>
        <h2>Gestão de médicos</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especialidade</th>
                <th>CRM</th>
                <th>Consultas</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.specialty}</td>
                  <td>{d.crm}</td>
                  <td>{d.scheduled_count}</td>
                  <td>
                    <span className={`badge ${d.active ? 'badge-success' : 'badge-danger'}`}>
                      {d.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleDoctor(d.id)}>
                      {d.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
