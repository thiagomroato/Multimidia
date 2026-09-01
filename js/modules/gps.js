// Mapa, localização em tempo real e rota (Leaflet + OpenStreetMap + OSRM/Nominatim públicos).
window.AutoPainel = window.AutoPainel || {};

(function () {
  const FALLBACK_COORDS = [-3.1019, -60.025]; // Manaus, AM — usado se a localização não estiver disponível

  let miniMap, fullMap;
  let miniMarker, fullMarker;
  let routeLine;
  let currentCoords = null;
  const gpsPillLabel = document.getElementById('gpsPillLabel');

  function tileLayer(map) {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
  }

  function buildMarkerIcon() {
    return L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#4FD8C4;border:2px solid #0A0D12;box-shadow:0 0 0 4px rgba(79,216,196,.25)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }

  function initMaps() {
    miniMap = L.map('miniMap', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, tap: false })
      .setView(FALLBACK_COORDS, 13);
    tileLayer(miniMap);
    miniMarker = L.marker(FALLBACK_COORDS, { icon: buildMarkerIcon() }).addTo(miniMap);

    fullMap = L.map('fullMap').setView(FALLBACK_COORDS, 13);
    tileLayer(fullMap);
    fullMarker = L.marker(FALLBACK_COORDS, { icon: buildMarkerIcon() }).addTo(fullMap);

    fullMap.on('click', (e) => {
      routeTo(e.latlng, `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    });
  }

  function updatePosition(lat, lng) {
    currentCoords = [lat, lng];
    miniMarker.setLatLng(currentCoords);
    miniMap.panTo(currentCoords, { animate: false });
    fullMarker.setLatLng(currentCoords);
    if (!fullMap._userPanned) fullMap.panTo(currentCoords, { animate: true });
    gpsPillLabel.textContent = 'GPS ok';
  }

  function startWatch() {
    if (!('geolocation' in navigator)) {
      gpsPillLabel.textContent = 'Sem GPS';
      return;
    }
    navigator.geolocation.watchPosition(
      (pos) => updatePosition(pos.coords.latitude, pos.coords.longitude),
      () => { gpsPillLabel.textContent = 'Sem sinal'; },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    fullMap.on('dragstart', () => { fullMap._userPanned = true; });
  }

  async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) throw new Error('Endereço não encontrado');
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), label: data[0].display_name };
  }

  async function routeTo(destLatLng, label) {
    const origin = currentCoords ? { lat: currentCoords[0], lng: currentCoords[1] } : { lat: FALLBACK_COORDS[0], lng: FALLBACK_COORDS[1] };
    const routeHint = document.getElementById('routeHint');
    const routeInfo = document.getElementById('routeInfo');
    routeHint.textContent = 'Calculando rota…';

    if (routeLine) { fullMap.removeLayer(routeLine); routeLine = null; }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.routes || !data.routes.length) throw new Error('Sem rota');

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
      routeLine = L.polyline(coords, { color: '#4FD8C4', weight: 5, opacity: 0.85 }).addTo(fullMap);
      fullMap.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

      const km = (route.distance / 1000).toFixed(1);
      const min = Math.round(route.duration / 60);
      document.getElementById('routeDistance').textContent = `${km} km`;
      document.getElementById('routeDuration').textContent = `${min} min`;
      routeInfo.classList.remove('hidden');
      routeHint.textContent = `Destino: ${label}`;
    } catch (err) {
      routeHint.textContent = 'Não foi possível calcular a rota agora. Tente novamente.';
    }
  }

  document.getElementById('routeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('destInput');
    const query = input.value.trim();
    if (!query) return;
    const routeHint = document.getElementById('routeHint');
    routeHint.textContent = 'Buscando endereço…';
    try {
      const place = await geocode(query);
      await routeTo({ lat: place.lat, lng: place.lng }, place.label);
    } catch (err) {
      routeHint.textContent = 'Endereço não encontrado. Tente ser mais específico.';
    }
  });

  document.getElementById('clearRouteBtn').addEventListener('click', () => {
    if (routeLine) { fullMap.removeLayer(routeLine); routeLine = null; }
    document.getElementById('routeInfo').classList.add('hidden');
    document.getElementById('routeHint').textContent = 'Toque no mapa ou pesquise um endereço para traçar a rota a partir da sua posição atual.';
    document.getElementById('destInput').value = '';
  });

  window.AutoPainel.gps = {
    init() {
      initMaps();
      startWatch();
    },
    invalidate() {
      // Leaflet precisa recalcular o tamanho quando a tela volta a ficar visível
      if (miniMap) setTimeout(() => miniMap.invalidateSize(), 50);
      if (fullMap) setTimeout(() => fullMap.invalidateSize(), 50);
    },
    getCoords() { return currentCoords || { lat: FALLBACK_COORDS[0], lng: FALLBACK_COORDS[1] }; },
  };
})();
