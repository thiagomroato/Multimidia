// Relógio e data da barra de status
(function () {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    dateEl.textContent = now.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  tick();
  setInterval(tick, 1000 * 15);

  // Bateria do dispositivo (quando suportado pelo navegador)
  const batteryLabel = document.getElementById('batteryPillLabel');
  if ('getBattery' in navigator) {
    navigator.getBattery().then((battery) => {
      const render = () => {
        batteryLabel.textContent = `${Math.round(battery.level * 100)}%`;
      };
      render();
      battery.addEventListener('levelchange', render);
    });
  } else {
    batteryLabel.textContent = '—';
  }
})();
