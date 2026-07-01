const API = '/api'

function getToken() {
  return localStorage.getItem('medsched_token')
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Doctors
  searchDoctors: (params) => {
    const q = new URLSearchParams(params).toString()
    return request(`/doctors?${q}`)
  },
  getSpecialties: () => request('/doctors/specialties'),
  getDoctor: (id) => request(`/doctors/${id}`),
  getAvailability: (id, from, to) => {
    const q = new URLSearchParams({ from, to }).toString()
    return request(`/doctors/${id}/availability?${q}`)
  },
  addAvailability: (id, slots) =>
    request(`/doctors/${id}/availability`, { method: 'POST', body: JSON.stringify({ slots }) }),
  removeAvailability: (id, slotId) =>
    request(`/doctors/${id}/availability/${slotId}`, { method: 'DELETE' }),

  // Appointments
  book: (body) => request('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  myAppointments: (status) => request(`/appointments/my${status ? `?status=${status}` : ''}`),
  doctorAgenda: (date) => request(`/appointments/doctor${date ? `?date=${date}` : ''}`),
  getAppointment: (id) => request(`/appointments/${id}`),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  rescheduleAppointment: (id, availabilityId) =>
    request(`/appointments/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ availabilityId }) }),

  // Admin
  adminMetrics: () => request('/admin/metrics'),
  adminDoctors: () => request('/admin/doctors'),
  toggleDoctor: (id) => request(`/admin/doctors/${id}/toggle`, { method: 'PATCH' }),
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTime(time) {
  return time
}

export function starRating(rating) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}
