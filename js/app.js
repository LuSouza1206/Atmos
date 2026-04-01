let currentCity = "são paulo";
let savedCities = JSON.parse(localStorage.getItem("atmos_saved") || "[]");
let isDark = localStorage.getItem("atmos_theme") !== "light";

function applyTheme() {
  document.body.classList.toggle("light", !isDark);
  document.getElementById("themeBtn").textContent = isDark ? "🌙" : "☀️";
}

document.getElementById("themeBtn").addEventListener("click", () => {
  isDark = !isDark;
  localStorage.setItem("atmos_theme", isDark ? "dark" : "light");
  applyTheme();
});

function updateClock() {
  const now = new Date();
  const el = document.getElementById("clock");
  if (el) el.textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

setInterval(updateClock, 1000);

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function getForecastType(condition) {
  if (condition.includes("Chuva") || condition.includes("Chuvoso")) return "rainy";
  if (condition.includes("nublado") || condition.includes("Nublado") || condition.includes("Ventoso")) return "cloudy";
  return "sunny";
}

function buildHourly(baseTemp) {
  const weatherIcons = ["☀️", "🌤️", "⛅", "🌦️", "🌧️"];
  const now = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const time = new Date(now.getTime() + i * 3600000);
    const label = i === 0 ? "Agora" : time.getHours().toString().padStart(2, "0") + ":00";
    const variation = Math.round((Math.random() - 0.5) * 6);

    return {
      time,
      label,
      icon: weatherIcons[Math.floor(Math.random() * weatherIcons.length)],
      temp: baseTemp + variation,
      isNow: i === 0,
    };
  });
}

function renderHourly(baseTemp) {
  const hours = buildHourly(baseTemp);

  document.getElementById("hourly").innerHTML = hours.map((h) => `
    <div class="hour ${h.isNow ? "now" : ""}">
      <div class="hour-time">${h.label}</div>
      <div class="hour-icon">${h.icon}</div>
      <div class="hour-temp">${h.temp}°</div>
    </div>
  `).join("");
}

function renderForecast(condition) {
  const fc = forecasts[getForecastType(condition)];

  document.getElementById("forecast").innerHTML = fc.map((d) => `
    <div class="fc-item">
      <div class="fc-day">${d.day}</div>
      <div class="fc-icon">${d.icon}</div>
      <div class="fc-desc">${d.desc}</div>
      <div class="fc-temp"><span class="fc-lo">${d.lo}°</span> / ${d.hi}°</div>
    </div>
  `).join("");
}

function renderSaved() {
  const list = document.getElementById("savedList");
  const empty = document.getElementById("emptyMsg");

  if (savedCities.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = savedCities.map((city) => {
    const d = weatherData[city.toLowerCase()];
    return `
      <div class="saved-chip" onclick="loadCity('${city}')">
        ${d ? d.icon : "🏙️"} ${city}
        <small>${d ? d.temp + "°" : "—"}</small>
      </div>
    `;
  }).join("");
}

function loadCity(name) {
  const key = name.toLowerCase();
  const data = weatherData[key];

  if (!data) {
    showToast("Cidade não encontrada. Tente: Tokyo, London, Dubai…");
    return;
  }

  currentCity = name;
  document.getElementById("loading").classList.add("show");

  setTimeout(() => {
    document.getElementById("loading").classList.remove("show");

    document.getElementById("cityName").textContent = name;
    document.getElementById("meta").innerHTML = `${data.country} &middot; <span id="clock"></span>`;
    updateClock();

    document.getElementById("temp").textContent = `${data.temp}°`;
    document.getElementById("condition").textContent = data.condition;
    document.getElementById("feels").textContent = `Sensação: ${data.feels}°C`;
    document.getElementById("icon").textContent = data.icon;

    document.getElementById("humidity").innerHTML   = `${data.humidity} <span class="stat-unit">%</span>`;
    document.getElementById("wind").innerHTML       = `${data.wind} <span class="stat-unit">km/h</span>`;
    document.getElementById("visibility").innerHTML = `${data.visibility} <span class="stat-unit">km</span>`;
    document.getElementById("pressure").innerHTML   = `${data.pressure} <span class="stat-unit">hPa</span>`;

    document.getElementById("uvTitle").textContent = `${data.uv} — ${data.uvLabel}`;
    document.getElementById("uvDot").style.left = Math.min(data.uvPct, 92) + "%";

    renderHourly(data.temp);
    renderForecast(data.condition);

    document.getElementById("saveBtn").classList.toggle("active", savedCities.includes(name));
    document.getElementById("searchInput").value = "";
  }, 650);
}

function toggleSave() {
  const idx = savedCities.indexOf(currentCity);

  if (idx === -1) {
    savedCities.push(currentCity);
    showToast(`✓ ${currentCity} salva!`);
  } else {
    savedCities.splice(idx, 1);
    showToast(`Removido: ${currentCity}`);
  }

  localStorage.setItem("atmos_saved", JSON.stringify(savedCities));
  document.getElementById("saveBtn").classList.toggle("active", savedCities.includes(currentCity));
  renderSaved();
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const val = document.getElementById("searchInput").value.trim();
  if (!val) return;

  const formatted = val.replace(/\b\w/g, (c) => c.toUpperCase());
  loadCity(formatted);
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("searchBtn").click();
});

applyTheme();
renderSaved();
loadCity("São Paulo");