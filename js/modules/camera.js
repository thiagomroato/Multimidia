// Câmera de ré: usa getUserMedia. Em um tablet real de bordo, a fonte de vídeo
// costuma ser um capturador USB/AV conectado à câmera do veículo — se o navegador
// reconhecer esse capturador como uma webcam, ele aparece na lista de câmeras abaixo.
window.AutoPainel = window.AutoPainel || {};

(function () {
  const video = document.getElementById('cameraFeed');
  const offOverlay = document.getElementById('cameraOff');
  const startBtn = document.getElementById('cameraStartBtn');
  const switchBtn = document.getElementById('cameraSwitchBtn');
  const stopBtn = document.getElementById('cameraStopBtn');

  let currentStream = null;
  let devices = [];
  let deviceIndex = 0;

  async function listDevices() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      devices = all.filter((d) => d.kind === 'videoinput');
    } catch (e) {
      devices = [];
    }
  }

  async function start(preferredDeviceId) {
    try {
      const constraints = preferredDeviceId
        ? { video: { deviceId: { exact: preferredDeviceId } }, audio: false }
        : { video: { facingMode: { ideal: 'environment' } }, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      video.srcObject = stream;
      offOverlay.classList.add('hidden');
      await listDevices();
    } catch (err) {
      offOverlay.classList.remove('hidden');
      offOverlay.querySelector('p').textContent = 'Não foi possível acessar a câmera (permissão negada ou indisponível).';
    }
  }

  function stop() {
    if (currentStream) {
      currentStream.getTracks().forEach((t) => t.stop());
      currentStream = null;
    }
    video.srcObject = null;
    offOverlay.classList.remove('hidden');
    offOverlay.querySelector('p').textContent = 'Câmera desligada';
  }

  startBtn.addEventListener('click', () => start());
  stopBtn.addEventListener('click', stop);
  switchBtn.addEventListener('click', async () => {
    if (!devices.length) await listDevices();
    if (!devices.length) return;
    deviceIndex = (deviceIndex + 1) % devices.length;
    start(devices[deviceIndex].deviceId);
  });

  window.AutoPainel.camera = {
    onEnter() {
      // Não inicia automaticamente: aguarda o toque do usuário para pedir permissão.
    },
    onLeave() {
      // Mantém a câmera ligada em segundo plano é aceitável para uso veicular,
      // mas por padrão desligamos para economizar bateria em modo demonstração.
    },
  };
})();
