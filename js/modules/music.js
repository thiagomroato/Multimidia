// Tocador de música local (arquivos escolhidos pelo usuário) com visualizador
// baseado na Web Audio API.
window.AutoPainel = window.AutoPainel || {};

(function () {
  const audio = new Audio();
  const input = document.getElementById('musicInput');
  const playlistEl = document.getElementById('musicPlaylist');
  const titleEl = document.getElementById('musicTitle');
  const subEl = document.getElementById('musicSub');
  const playBtn = document.getElementById('musicPlay');
  const prevBtn = document.getElementById('musicPrev');
  const nextBtn = document.getElementById('musicNext');
  const seek = document.getElementById('musicSeek');
  const timeEl = document.getElementById('musicTime');
  const durationEl = document.getElementById('musicDuration');
  const canvas = document.getElementById('musicViz');
  const ctx2d = canvas.getContext('2d');

  let tracks = []; // { name, url, file }
  let currentIndex = -1;
  let audioCtx, analyser, source, dataArray;
  let rafId = null;

  function fmtTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function renderPlaylist() {
    if (!tracks.length) {
      playlistEl.innerHTML = '<li class="playlist__empty">Nenhuma música na fila</li>';
      return;
    }
    playlistEl.innerHTML = tracks
      .map((t, i) => `<li class="playlist__item${i === currentIndex ? ' is-active' : ''}" data-index="${i}"><span>${t.name}</span></li>`)
      .join('');
    playlistEl.querySelectorAll('.playlist__item').forEach((li) => {
      li.addEventListener('click', () => playIndex(parseInt(li.dataset.index, 10)));
    });
  }

  function playIndex(i) {
    if (i < 0 || i >= tracks.length) return;
    currentIndex = i;
    const track = tracks[i];
    audio.src = track.url;
    audio.play();
    titleEl.textContent = track.name.replace(/\.[^/.]+$/, '');
    subEl.textContent = `Faixa ${i + 1} de ${tracks.length}`;
    renderPlaylist();
    setupAnalyser();
  }

  function setupAnalyser() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (!rafId) drawViz();
  }

  function drawViz() {
    rafId = requestAnimationFrame(drawViz);
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height;
    ctx2d.clearRect(0, 0, w, h);
    const barCount = dataArray.length;
    const barWidth = w / barCount;
    for (let i = 0; i < barCount; i++) {
      const v = dataArray[i] / 255;
      const barH = Math.max(2, v * h);
      ctx2d.fillStyle = i % 3 === 0 ? '#F2A93B' : '#4FD8C4';
      ctx2d.fillRect(i * barWidth, h - barH, barWidth - 2, barH);
    }
  }

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      tracks.push({ name: file.name, url: URL.createObjectURL(file), file });
    });
    renderPlaylist();
    if (currentIndex === -1 && tracks.length) playIndex(0);
    input.value = '';
  });

  playBtn.addEventListener('click', () => {
    if (!tracks.length) return;
    if (currentIndex === -1) { playIndex(0); return; }
    if (audio.paused) { audio.play(); setupAnalyser(); } else { audio.pause(); }
  });

  prevBtn.addEventListener('click', () => {
    if (!tracks.length) return;
    playIndex((currentIndex - 1 + tracks.length) % tracks.length);
  });
  nextBtn.addEventListener('click', () => {
    if (!tracks.length) return;
    playIndex((currentIndex + 1) % tracks.length);
  });

  audio.addEventListener('play', () => {
    playBtn.querySelector('use').setAttribute('href', '#i-pause');
  });
  audio.addEventListener('pause', () => {
    playBtn.querySelector('use').setAttribute('href', '#i-play2');
  });
  audio.addEventListener('ended', () => {
    if (currentIndex < tracks.length - 1) playIndex(currentIndex + 1);
  });
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    seek.value = (audio.currentTime / audio.duration) * 100;
    timeEl.textContent = fmtTime(audio.currentTime);
    durationEl.textContent = fmtTime(audio.duration);
  });
  seek.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (seek.value / 100) * audio.duration;
  });

  window.AutoPainel.music = { init() { renderPlaylist(); } };
})();
