import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { computeSearchPolygon, DEFAULT_OPTIONS } from './search_algorithm.js';

const VWORLD_API_KEY = 'YOUR_API_KEY';

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      vworld: {
        type: 'raster',
        tiles: [
          `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
        ],
        tileSize: 256,
        attribution: '© Vworld / 국토교통부',
      },
    },
    layers: [
      {
        id: 'vworld-base',
        type: 'raster',
        source: 'vworld',
      },
    ],
  },
  center: [128.0, 36.5],
  zoom: 10,
  maxZoom: 19,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

const statusEl = document.getElementById('status');

function setStatus(message) {
  statusEl.textContent = message;
}

map.on('load', () => {
  setStatus('지도를 클릭하여 LKP(최종목격위치)를 설정하세요.');
});

map.on('click', (event) => {
  const lkp = [event.lngLat.lng, event.lngLat.lat];
  setStatus('우선 수색구간을 계산 중입니다…');

  const polygon = computeSearchPolygon(lkp, {
    maxSearchHours: DEFAULT_OPTIONS.maxSearchHours,
    weatherFactor: DEFAULT_OPTIONS.weatherFactor,
  });

  if (!polygon) {
    setStatus('수색구간을 계산할 수 없습니다. 다른 위치를 클릭해 보세요.');
    return;
  }

  upsertLkpMarker(lkp);
  drawSearchPolygon(polygon);

  setStatus(
    `LKP 설정 완료 (${lkp[1].toFixed(5)}°N, ${lkp[0].toFixed(5)}°E) — ` +
      `${DEFAULT_OPTIONS.maxSearchHours}시간 우선 수색구간 표시`,
  );
});

function upsertLkpMarker(lkp) {
  if (map.getSource('lkp-point')) {
    map.getSource('lkp-point').setData({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: lkp },
      properties: { label: 'LKP' },
    });
    return;
  }

  map.addSource('lkp-point', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: lkp },
      properties: { label: 'LKP' },
    },
  });

  map.addLayer({
    id: 'lkp-point-layer',
    type: 'circle',
    source: 'lkp-point',
    paint: {
      'circle-radius': 8,
      'circle-color': '#facc15',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#713f12',
    },
  });
}

function drawSearchPolygon(feature) {
  const data = { type: 'FeatureCollection', features: [feature] };

  if (map.getSource('search-polygon')) {
    map.getSource('search-polygon').setData(data);
    return;
  }

  map.addSource('search-polygon', { type: 'geojson', data });

  map.addLayer({
    id: 'search-polygon-fill',
    type: 'fill',
    source: 'search-polygon',
    paint: {
      'fill-color': '#dc2626',
      'fill-opacity': 0.35,
    },
  });

  map.addLayer({
    id: 'search-polygon-outline',
    type: 'line',
    source: 'search-polygon',
    paint: {
      'line-color': '#b91c1c',
      'line-width': 2,
    },
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('Service Worker 등록 실패:', err);
    });
  });
}
