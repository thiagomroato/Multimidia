// Streaming: Netflix/Prime/Disney+/Spotify não podem ser incorporados via iframe
// (bloqueiam com X-Frame-Options/DRM), então abrimos o app/site oficial em nova guia.
// O YouTube permite incorporar vídeos individuais, então oferecemos um player real.
window.AutoPainel = window.AutoPainel || {};

(function () {
  const APP_URLS = {
    netflix: 'https://www.netflix.com',
    prime: 'https://www.primevideo.com',
    disney: 'https://www.disneyplus.com',
    spotify: 'https://open.spotify.com',
  };

  document.querySelectorAll('.streamcard').forEach((card) => {
    card.addEventListener('click', () => {
      const app = card.dataset.app;
      const url = APP_URLS[app];
      if (url) window.open(url, '_blank', 'noopener');
    });
  });

  function extractYoutubeId(input) {
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const url = new URL(trimmed);
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
    } catch (e) {
      return null;
    }
    return null;
  }

  document.getElementById('youtubeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('youtubeInput');
    const id = extractYoutubeId(input.value);
    const frame = document.getElementById('youtubeFrame');
    if (!id) {
      frame.innerHTML = '<p class="youtube-placeholder">Link ou ID inválido. Cole a URL completa do vídeo do YouTube.</p>';
      return;
    }
    frame.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1" title="YouTube" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  });
})();
