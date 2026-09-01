// Controlador principal: navegação entre telas, ajustes e inicialização dos módulos.
(function () {
  const screens = document.querySelectorAll('.screen');
  const dockBtns = document.querySelectorAll('.dock__btn');
  const gotoTriggers = document.querySelectorAll('[data-goto]');

  function goto(name) {
    screens.forEach((s) => s.classList.toggle('active', s.id === `screen-${name}`));
    dockBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.goto === name));

    if (name === 'nav' || name === 'home') {
      window.AutoPainel.gps && window.AutoPainel.gps.invalidate();
    }
    if (name !== 'camera') {
      window.AutoPainel.camera && window.AutoPainel.camera.onLeave();
    }
  }

  gotoTriggers.forEach((el) => {
    el.addEventListener('click', () => goto(el.dataset.goto));
  });

  // ===== Ajustes: unidade de velocidade =====
  document.getElementById('unitSetting').addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented__opt');
    if (!btn) return;
    document.querySelectorAll('#unitSetting .segmented__opt').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    window.AutoPainel.speedometer.setUnit(btn.dataset.unit);
  });

  // ===== Ajustes: tema =====
  document.getElementById('themeSetting').addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented__opt');
    if (!btn) return;
    document.querySelectorAll('#themeSetting .segmented__opt').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.documentElement.setAttribute('data-theme', btn.dataset.theme);
  });

  // ===== Ajustes: permissões =====
  document.getElementById('permissionsBtn').addEventListener('click', async () => {
    const results = [];
    try {
      await navigator.geolocation.getCurrentPosition(() => {}, () => {});
      results.push('Localização: solicitada');
    } catch (e) { results.push('Localização: indisponível'); }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      results.push('Câmera: autorizada');
    } catch (e) {
      results.push('Câmera: não autorizada');
    }
    alert(results.join('\n'));
  });

  // ===== Inicialização dos módulos =====
  window.AutoPainel.speedometer.init();
  window.AutoPainel.gps.init();
  window.AutoPainel.music.init();
  window.AutoPainel.weather.init();

  goto('home');
})();
