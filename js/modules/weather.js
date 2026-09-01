// Clima via Open-Meteo (API pública, sem necessidade de chave).
window.AutoPainel = window.AutoPainel || {};

(function () {
  const FALLBACK_COORDS = { lat: -3.1019, lng: -60.025 }; // Manaus, AM

  const WMO_DESC = {
    0: 'Céu limpo', 1: 'Predomínio de sol', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Neblina', 48: 'Neblina com geada',
    51: 'Garoa fraca', 53: 'Garoa', 55: 'Garoa forte',
    61: 'Chuva fraca', 63: 'Chuva', 65: 'Chuva forte',
    71: 'Neve fraca', 73: 'Neve', 75: 'Neve forte',
    80: 'Pancadas de chuva', 81: 'Pancadas de chuva fortes', 82: 'Pancadas de chuva violentas',
    95: 'Tempestade', 96: 'Tempestade com granizo', 99: 'Tempestade severa com granizo',
  };

  function describeCode(code) { return WMO_DESC[code] || 'Condição desconhecida'; }

  function weatherIconFor(code) {
    // Reaproveita o mesmo ícone de nuvem do sprite para todas as condições,
    // mantendo a interface simples e coerente.
    return '#i-cloud';
  }

  async function fetchWeather(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao buscar clima');
    return res.json();
  }

  async function reverseGeocodeLabel(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const res = await fetch(url);
      const data = await res.json();
      const a = data.address || {};
      return a.city || a.town || a.village || a.municipality || data.display_name || 'Localização atual';
    } catch (e) {
      return 'Localização atual';
    }
  }

  function render(data, placeLabel) {
    const c = data.current;
    const temp = Math.round(c.temperature_2m);
    const feels = Math.round(c.apparent_temperature);
    const desc = describeCode(c.weather_code);

    document.getElementById('weatherPillTemp').textContent = `${temp}°`;
    document.getElementById('miniWeatherTemp').textContent = `${temp}°C`;
    document.getElementById('miniWeatherDesc').textContent = desc;
    document.getElementById('weatherNowTemp').textContent = `${temp}°C`;
    document.getElementById('weatherNowDesc').textContent = desc;
    document.getElementById('weatherNowPlace').textContent = placeLabel;
    document.getElementById('weatherFeels').textContent = `${feels}°`;
    document.getElementById('weatherWind').textContent = `${Math.round(c.wind_speed_10m)} km/h`;
    document.getElementById('weatherHumidity').textContent = `${Math.round(c.relative_humidity_2m)}%`;

    const forecastEl = document.getElementById('weatherForecast');
    const days = data.daily.time.slice(0, 5);
    forecastEl.innerHTML = days
      .map((iso, i) => {
        const d = new Date(iso + 'T12:00:00');
        const dayName = i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' });
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);
        return `<div class="forecast-row">
          <span class="forecast-row__day">${dayName}</span>
          <span>${describeCode(data.daily.weather_code[i])}</span>
          <span class="forecast-row__range">${max}°<span>/ ${min}°</span></span>
        </div>`;
      })
      .join('');
  }

  async function load(lat, lng, placeLabel) {
    try {
      const data = await fetchWeather(lat, lng);
      render(data, placeLabel);
    } catch (e) {
      document.getElementById('weatherNowDesc').textContent = 'Não foi possível carregar o clima';
    }
  }

  window.AutoPainel.weather = {
    async init() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const label = await reverseGeocodeLabel(latitude, longitude);
            load(latitude, longitude, label);
          },
          () => load(FALLBACK_COORDS.lat, FALLBACK_COORDS.lng, 'Manaus, AM'),
          { timeout: 8000 }
        );
      } else {
        load(FALLBACK_COORDS.lat, FALLBACK_COORDS.lng, 'Manaus, AM');
      }
    },
  };
})();
