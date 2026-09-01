// Velocímetro: usa navigator.geolocation (campo `speed`, em m/s) quando disponível.
// Muitos tablets (principalmente versões só-wifi) não têm chip de GPS, então
// existe um modo de demonstração que simula a velocidade com uma senoide.
window.AutoPainel = window.AutoPainel || {};

(function () {
  const gaugeFill = document.getElementById('gaugeFill');
  const speedValue = document.getElementById('speedValue');
  const speedAccuracy = document.getElementById('speedAccuracy');
  const demoBtn = document.getElementById('demoModeBtn');

  const CIRCUMFERENCE = 653; // aprox. 2*pi*104
  const MAX_SPEED = 180; // km/h no fim do arco

  let unit = 'kmh'; // ou 'mph'
  let demoMode = false;
  let demoT = 0;
  let demoTimer = null;
  let watchId = null;
  let lastRealSpeed = null;

  function setGauge(speedKmh) {
    const ratio = Math.min(1, Math.max(0, speedKmh / MAX_SPEED));
    gaugeFill.style.strokeDasharray = `${ratio * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const displaySpeed = unit === 'mph' ? speedKmh * 0.621371 : speedKmh;
    speedValue.textContent = Math.round(displaySpeed);
  }

  function updateUnitLabel() {
    document.querySelector('.gauge__unit').textContent = unit === 'mph' ? 'mph' : 'km/h';
  }

  function startGeolocation() {
    if (!('geolocation' in navigator)) {
      speedAccuracy.textContent = 'GPS indisponível neste dispositivo';
      return;
    }
    speedAccuracy.textContent = 'Procurando sinal de GPS…';
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { speed, accuracy } = pos.coords;
        if (speed != null && !Number.isNaN(speed)) {
          lastRealSpeed = speed * 3.6; // m/s -> km/h
          if (!demoMode) {
            setGauge(lastRealSpeed);
            speedAccuracy.textContent = `GPS ativo · precisão ${Math.round(accuracy)} m`;
          }
        } else if (!demoMode) {
          speedAccuracy.textContent = 'GPS conectado, sem leitura de velocidade (fique em movimento)';
        }
      },
      (err) => {
        if (!demoMode) {
          speedAccuracy.textContent = 'Sem sinal de GPS — tente o modo demonstração';
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }

  function startDemo() {
    demoMode = true;
    demoBtn.classList.add('is-active');
    demoBtn.textContent = 'Parar demonstração';
    demoTimer = setInterval(() => {
      demoT += 0.06;
      const simulated = 60 + Math.sin(demoT) * 55 + Math.sin(demoT * 2.7) * 10;
      setGauge(Math.max(0, simulated));
      speedAccuracy.textContent = 'Modo demonstração (velocidade simulada)';
    }, 200);
  }

  function stopDemo() {
    demoMode = false;
    demoBtn.classList.remove('is-active');
    demoBtn.textContent = 'Modo demonstração';
    clearInterval(demoTimer);
    if (lastRealSpeed != null) {
      setGauge(lastRealSpeed);
      speedAccuracy.textContent = 'GPS ativo';
    } else {
      setGauge(0);
      speedAccuracy.textContent = 'Sem sinal de GPS — tente o modo demonstração';
    }
  }

  demoBtn.addEventListener('click', () => {
    if (demoMode) stopDemo();
    else startDemo();
  });

  window.AutoPainel.speedometer = {
    init() {
      updateUnitLabel();
      setGauge(0);
      startGeolocation();
    },
    setUnit(newUnit) {
      unit = newUnit;
      updateUnitLabel();
    },
  };
})();
