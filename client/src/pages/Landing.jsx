import { useState, useEffect } from 'react'
import Header from '../components/Layout/Header'
import DoctorCard from '../components/DoctorCard'
import { api } from '../lib/api'
import styles from './Landing.module.css'

export default function Landing() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [insurance, setInsurance] = useState('')
  const [gender, setGender] = useState('')
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    api.getSpecialties().then(setSpecialties).catch(() => {})
    search({})
  }, [])

  const search = async (overrides = {}) => {
    setLoading(true)
    setSearched(true)
    try {
      const params = {
        q: overrides.q ?? query,
        specialty: overrides.specialty ?? specialty,
        insurance: overrides.insurance ?? insurance,
        gender: overrides.gender ?? gender,
      }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const results = await api.searchDoctors(params)
      setDoctors(results)
    } catch {
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search({})
  }

  return (
    <>
      <Header />
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Encontre seu médico e agende online</h1>
          <p className={styles.heroSubtitle}>
            Busque por especialidade, sintoma ou nome. Agende em poucos cliques.
          </p>

          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={styles.searchMain}>
              <input
                type="text"
                className={`input ${styles.searchInput}`}
                placeholder="Especialidade, sintoma ou nome do médico..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Buscar
              </button>
            </div>

            <div className={styles.filters}>
              <select
                className={`input ${styles.filterSelect}`}
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
              >
                <option value="">Todas especialidades</option>
                {specialties.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className={`input ${styles.filterSelect}`}
                value={insurance}
                onChange={e => setInsurance(e.target.value)}
              >
                <option value="">Todos convênios</option>
                <option value="Unimed">Unimed</option>
                <option value="Bradesco">Bradesco Saúde</option>
                <option value="SulAmérica">SulAmérica</option>
                <option value="Amil">Amil</option>
                <option value="Particular">Particular</option>
              </select>

              <select
                className={`input ${styles.filterSelect}`}
                value={gender}
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Qualquer gênero</option>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
              </select>

              <button type="button" className="btn btn-outline btn-sm" onClick={() => search({})}>
                Aplicar filtros
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className={styles.results}>
        <div className="container">
          {loading ? (
            <p className={styles.status}>Buscando médicos...</p>
          ) : searched ? (
            <>
              <h2 className={styles.resultsTitle}>
                {doctors.length} médico{doctors.length !== 1 ? 's' : ''} encontrado{doctors.length !== 1 ? 's' : ''}
              </h2>
              <div className={styles.resultsList}>
                {doctors.map(d => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
                {!doctors.length && (
                  <div className="empty-state">
                    <h3>Nenhum médico encontrado</h3>
                    <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}
