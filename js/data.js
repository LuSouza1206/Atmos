const weatherData = {
  "são paulo": {
    country: "Brasil", icon: "⛅", condition: "Parcialmente nublado",
    temp: 22, feels: 20, humidity: 68, wind: 14, visibility: 9, pressure: 1012,
    uv: 4, uvLabel: "Moderado", uvPct: 36,
  },
  "rio de janeiro": {
    country: "Brasil", icon: "☀️", condition: "Ensolarado",
    temp: 31, feels: 34, humidity: 72, wind: 18, visibility: 10, pressure: 1008,
    uv: 9, uvLabel: "Muito alto", uvPct: 82,
  },
  "tokyo": {
    country: "Japão", icon: "🌤️", condition: "Poucas nuvens",
    temp: 17, feels: 15, humidity: 55, wind: 22, visibility: 12, pressure: 1018,
    uv: 5, uvLabel: "Moderado", uvPct: 45,
  },
  "new york": {
    country: "EUA", icon: "🌧️", condition: "Chuvoso",
    temp: 14, feels: 11, humidity: 83, wind: 31, visibility: 5, pressure: 1005,
    uv: 2, uvLabel: "Baixo", uvPct: 18,
  },
  "london": {
    country: "Reino Unido", icon: "🌫️", condition: "Nublado",
    temp: 9, feels: 6, humidity: 88, wind: 25, visibility: 4, pressure: 1003,
    uv: 1, uvLabel: "Baixo", uvPct: 9,
  },
  "paris": {
    country: "França", icon: "🌦️", condition: "Chuva fraca",
    temp: 13, feels: 11, humidity: 79, wind: 20, visibility: 7, pressure: 1007,
    uv: 3, uvLabel: "Baixo", uvPct: 27,
  },
  "dubai": {
    country: "Emirados Árabes", icon: "☀️", condition: "Muito quente",
    temp: 38, feels: 42, humidity: 30, wind: 15, visibility: 10, pressure: 1005,
    uv: 11, uvLabel: "Extremo", uvPct: 100,
  },
  "sydney": {
    country: "Austrália", icon: "⛅", condition: "Ventoso",
    temp: 24, feels: 22, humidity: 61, wind: 35, visibility: 11, pressure: 1014,
    uv: 6, uvLabel: "Alto", uvPct: 54,
  },
};

const forecasts = {
  sunny: [
    { day: "Amanhã", icon: "☀️", desc: "Ensolarado",    hi: 30, lo: 22 },
    { day: "Qua",    icon: "⛅", desc: "Poucas nuvens", hi: 28, lo: 21 },
    { day: "Qui",    icon: "🌦️", desc: "Chuva leve",   hi: 25, lo: 19 },
    { day: "Sex",    icon: "☀️", desc: "Ensolarado",    hi: 29, lo: 20 },
    { day: "Sáb",    icon: "⛅", desc: "Nublado",       hi: 26, lo: 18 },
  ],
  cloudy: [
    { day: "Amanhã", icon: "⛅", desc: "Nublado",       hi: 24, lo: 18 },
    { day: "Qua",    icon: "🌦️", desc: "Chuva fraca",  hi: 22, lo: 16 },
    { day: "Qui",    icon: "🌧️", desc: "Chuva",        hi: 20, lo: 15 },
    { day: "Sex",    icon: "⛅", desc: "Nublado",       hi: 23, lo: 17 },
    { day: "Sáb",    icon: "☀️", desc: "Sol voltando", hi: 26, lo: 18 },
  ],
  rainy: [
    { day: "Amanhã", icon: "🌧️", desc: "Chuva forte",  hi: 15, lo: 10 },
    { day: "Qua",    icon: "🌩️", desc: "Tempestade",   hi: 13, lo: 9  },
    { day: "Qui",    icon: "🌦️", desc: "Chuva leve",   hi: 14, lo: 10 },
    { day: "Sex",    icon: "⛅", desc: "Nublado",       hi: 16, lo: 11 },
    { day: "Sáb",    icon: "☀️", desc: "Abrindo",      hi: 19, lo: 12 },
  ],
};