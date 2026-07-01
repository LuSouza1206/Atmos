<div align="center">

# MedSched

**PT** · [EN](#english)

Sistema de agendamento de consultas médicas — busca, perfis, calendário e dashboards por perfil.

![status](https://img.shields.io/badge/status-live-2563EB?style=flat-square) ![React](https://img.shields.io/badge/React-18-black?style=flat-square) ![Node](https://img.shields.io/badge/Node-Express-black?style=flat-square) ![SQLite](https://img.shields.io/badge/DB-SQLite-black?style=flat-square)

</div>

---

## Português

### Sobre

Plataforma full-stack de agendamento médico inspirada em **Doctolib** e **Zocdoc**: interface limpa e profissional, busca por especialidade/convênio, cards com próxima data disponível, fluxo de agendamento em etapas e dashboards para paciente, médico e admin.

### Funcionalidades

- **Landing com busca** — hero central, filtros por especialidade, convênio e gênero
- **Resultados enxutos** — cards horizontais mostrando só a primeira data disponível
- **Perfil do médico** — bio, convênios, avaliações e calendário de horários
- **Fluxo de agendamento** — seleção de horário → confirmação
- **Dashboard paciente** — consultas futuras/passadas, cancelar e reagendar
- **Dashboard médico** — agenda do dia e gerenciamento de disponibilidade
- **Dashboard admin** — métricas e gestão de médicos
- **Autenticação JWT** — cadastro com perfil paciente ou médico

### Stack

| Camada | Tecnologia |
|--------|------------|
| Front-end | React 18 + Vite + React Router |
| Back-end | Node.js + Express |
| Banco | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Estilização | CSS global + CSS Modules |

### Design

- **Primária:** azul `#2563EB` / `#1D4ED8`
- **CTA:** amarelo `#F5A623` (exclusivo para ações principais)
- **Tipografia:** Montserrat (títulos) + Roboto (corpo)
- **Grid:** ritmo de 8px, sombras sutis, sem glassmorphism

### Estrutura

```
medsched/
├── server/
│   ├── index.js           # Express API
│   ├── db.js              # Schema SQLite
│   ├── seed.js            # Dados demo
│   ├── routes/            # auth, doctors, appointments, admin
│   └── .env.example
└── client/
    └── src/
        ├── pages/         # 8 telas
        ├── components/    # DoctorCard, TimeSlotGrid, Layout
        ├── context/       # AuthContext
        └── lib/api.js
```

### Como rodar

```bash
# Terminal 1 — servidor
cd server
cp .env.example .env
npm install
npm run seed    # popula banco com dados demo
npm run dev

# Terminal 2 — client
cd client
npm install
npm run dev
```

Abra http://localhost:5173

### Contas demo (senha: `123456`)

| Email | Perfil |
|-------|--------|
| maria@email.com | Paciente |
| ana@medsched.com | Médica |
| admin@medsched.com | Admin |

---

## English

### About

Full-stack medical appointment platform inspired by **Doctolib** and **Zocdoc**: clean professional UI, specialty/insurance search, doctor cards with next available slot, step-by-step booking, and role-based dashboards.

### Features

- **Search landing** — central hero, filters by specialty, insurance, gender
- **Lean results** — horizontal cards showing only the first available date
- **Doctor profile** — bio, insurance, reviews, availability calendar
- **Booking flow** — time selection → confirmation
- **Patient dashboard** — upcoming/past appointments, cancel and reschedule
- **Doctor dashboard** — daily agenda and availability management
- **Admin dashboard** — metrics and doctor management
- **JWT auth** — register as patient or doctor

### Getting Started

```bash
cd server && cp .env.example .env && npm install && npm run seed && npm run dev
cd client && npm install && npm run dev
```

Open http://localhost:5173

---

<div align="center">

Feito com React + Node.js + SQLite

</div>
