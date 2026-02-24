<div align="center">

# Atmos

**PT** · [EN](#english)

Dashboard de clima imersivo com back-end próprio, cache no servidor e dados reais.

![status](https://img.shields.io/badge/status-live-60a5fa?style=flat-square) ![React](https://img.shields.io/badge/React-18-black?style=flat-square) ![Node](https://img.shields.io/badge/Node-Express-black?style=flat-square) ![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-black?style=flat-square)

</div>

---

## Português

### Sobre

App de previsão do tempo full-stack com interface imersiva — fundo dinâmico por condição climática, tipografia de display e gráfico de temperatura semanal. O back-end em Node/Express faz proxy das chamadas à API, protege a chave de acesso e aplica cache em memória de 10 minutos.

### Funcionalidades

- **Fundo dinâmico** — imagem muda conforme a condição climática (sol, chuva, tempestade...)
- **Busca com autocomplete** — sugestões em tempo real via Geocoding API
- **Dados atuais** — temperatura, sensação, umidade, vento, visibilidade, pressão
- **Gráfico semanal** — linha SVG conectando as temperaturas dos próximos 6 dias
- **Cidades salvas** — persistência via localStorage
- **API key protegida** — chave nunca exposta no front-end, fica no servidor

### Stack

| Camada | Tecnologia |
|--------|------------|
| Front-end | React 18 + Vite |
| Back-end | Node.js + Express |
| API | OpenWeatherMap (free tier) |
| Cache | In-memory no servidor (10 min TTL) |
| Estilização | CSS Modules + Clash Display |

### Estrutura
atmos/
├── server/
│   ├── index.js        # Express: proxy, cache, rotas /weather /forecast /uv /search
│   ├── .env.example    # Modelo — copie para .env e adicione sua chave
│   └── package.json
└── client/
├── src/
│   ├── components/
│   │   ├── TempGraph       # Gráfico SVG semanal
│   │   ├── SearchBar       # Busca com autocomplete
│   │   └── SavedCities     # Cidades salvas
│   ├── hooks/
│   │   └── useWeather      # Fetch paralelo + cache local
│   └── lib/
│       ├── api.js          # Chamadas ao back-end
│       └── weather.js      # Ícones, UV, agrupamento de forecast
└── package.json

### Como rodar

```bash
git clone https://github.com/LuSouza1206/Atmos.git
cd Atmos

# Configure a chave
cp server/.env.example server/.env
# Edite server/.env com sua chave do OpenWeatherMap

# Terminal 1 — servidor
cd server && npm install && npm run dev

# Terminal 2 — client
cd client && npm install && npm run dev
```

Abra http://localhost:5173

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `OWM_API_KEY` | Chave da API OpenWeatherMap |
| `PORT` | Porta do servidor (padrão: 3001) |

---

## English

### About

Full-stack weather app with an immersive interface — dynamic background per weather condition, display typography, and a weekly temperature graph. The Node/Express back-end proxies API calls, protects the access key, and applies a 10-minute in-memory cache.

### Features

- **Dynamic background** — image changes based on weather condition (sun, rain, storm...)
- **Autocomplete search** — real-time city suggestions via Geocoding API
- **Current data** — temperature, feels like, humidity, wind, visibility, pressure
- **Weekly graph** — SVG line connecting temperatures for the next 6 days
- **Saved cities** — localStorage persistence
- **Protected API key** — key never exposed on the front-end, lives on the server

### Stack

| Layer | Technology |
|-------|------------|
| Front-end | React 18 + Vite |
| Back-end | Node.js + Express |
| API | OpenWeatherMap (free tier) |
| Cache | In-memory on server (10 min TTL) |
| Styling | CSS Modules + Clash Display |

### Getting Started

```bash
git clone https://github.com/LuSouza1206/Atmos.git
cd Atmos

# Set up the key
cp server/.env.example server/.env
# Edit server/.env with your OpenWeatherMap key

# Terminal 1 — server
cd server && npm install && npm run dev

# Terminal 2 — client
cd client && npm install && npm run dev
```

Open http://localhost:5173

---

<div align="center">

Feito com React + Node.js + OpenWeatherMap

</div>