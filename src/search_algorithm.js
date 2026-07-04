/**
 * 산악 수색 우선 수색구간(Polygon) 계산 모듈
 * 다익스트라 비용 거리 + Tobler 하이킹 함수 + 기상 보정 (v0.7 로직 기반)
 */

const TOBLER_MAX_SPEED_KMH = 6;
const TOBLER_EXPONENT = -3.5;
const TOBLER_SLOPE_OFFSET = 0.05;

const DEFAULT_OPTIONS = {
  gridRadius: 35,
  cellSizeM: 150,
  maxSearchHours: 4,
  weatherFactor: 1.0,
  elevationProvider: estimateSyntheticElevation,
};

/**
 * Tobler 하이킹 함수: 경사(Δh/Δd)에 따른 도보 속도(km/h)
 * @param {number} slope - 방향 경사 (상승=양수, 하강=음수)
 */
export function toblerSpeedKmh(slope) {
  return TOBLER_MAX_SPEED_KMH * Math.exp(TOBLER_EXPONENT * Math.abs(slope + TOBLER_SLOPE_OFFSET));
}

/**
 * Tobler 기반 이동 시간(시간) — 지형 보정
 * @param {number} horizontalDistM - 수평 거리(m)
 * @param {number} slope - 방향 경사
 */
export function toblerTravelTimeHours(horizontalDistM, slope) {
  const speedKmh = toblerSpeedKmh(slope);
  if (speedKmh <= 0) return Infinity;
  return horizontalDistM / 1000 / speedKmh;
}

/**
 * 기상 보정 계수 적용
 * @param {number} baseHours - 지형 보정 이동 시간
 * @param {number} weatherFactor - 1.0(맑음) ~ 2.0(악천후) 등
 */
export function applyWeatherCorrection(baseHours, weatherFactor = 1.0) {
  return baseHours * Math.max(weatherFactor, 0.1);
}

/**
 * 위·경도 1도당 미터 근사값 (한반도 중위도 기준)
 */
function metersPerDegree(lat) {
  const latRad = (lat * Math.PI) / 180;
  return {
    lng: 111_320 * Math.cos(latRad),
    lat: 110_540,
  };
}

/**
 * 데모용 합성 고도(m) — 실제 DEM 연동 시 elevationProvider로 교체
 */
export function estimateSyntheticElevation(lng, lat) {
  const x = lng * 120;
  const y = lat * 120;
  return 250 + 400 * Math.sin(x * 2.1) * Math.cos(y * 1.7) + 150 * Math.sin(x * 5.3 + y);
}

/**
 * 격자 인덱스 → [lng, lat]
 */
function cellToLngLat(row, col, centerLng, centerLat, cellSizeM, meters) {
  const offsetX = (col - 0) * cellSizeM;
  const offsetY = (row - 0) * cellSizeM;
  const lng = centerLng + offsetX / meters.lng;
  const lat = centerLat + offsetY / meters.lat;
  return [lng, lat];
}

/**
 * 다익스트라 알고리즘으로 LKP 기준 누적 이동시간(시간) 격자 계산
 * @param {[number, number]} lkp - [lng, lat]
 * @param {object} options
 * @returns {{ costs: Float64Array, gridRadius: number, cellSizeM: number, center: [number, number] }}
 */
export function dijkstraCostSurface(lkp, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [centerLng, centerLat] = lkp;
  const { gridRadius, cellSizeM, weatherFactor, elevationProvider } = opts;
  const size = gridRadius * 2 + 1;
  const total = size * size;
  const meters = metersPerDegree(centerLat);

  const elevations = new Float64Array(total);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const r = row - gridRadius;
      const c = col - gridRadius;
      const [lng, lat] = cellToLngLat(r, c, centerLng, centerLat, cellSizeM, meters);
      elevations[row * size + col] = elevationProvider(lng, lat);
    }
  }

  const costs = new Float64Array(total).fill(Infinity);
  const visited = new Uint8Array(total);
  const centerIdx = gridRadius * size + gridRadius;
  costs[centerIdx] = 0;

  const neighbors = [
    [-1, 0, 1],
    [-1, 1, Math.SQRT2],
    [0, 1, 1],
    [1, 1, Math.SQRT2],
    [1, 0, 1],
    [1, -1, Math.SQRT2],
    [0, -1, 1],
    [-1, -1, Math.SQRT2],
  ];

  const heap = [{ idx: centerIdx, cost: 0 }];

  while (heap.length > 0) {
    heap.sort((a, b) => a.cost - b.cost);
    const { idx, cost } = heap.shift();
    if (visited[idx] || cost > costs[idx]) continue;
    visited[idx] = 1;

    const row = Math.floor(idx / size);
    const col = idx % size;
    const elevFrom = elevations[idx];

    for (const [dr, dc, factor] of neighbors) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;

      const nIdx = nr * size + nc;
      if (visited[nIdx]) continue;

      const elevTo = elevations[nIdx];
      const horizontalDistM = cellSizeM * factor;
      const elevDiff = elevTo - elevFrom;
      const slope = elevDiff / horizontalDistM;

      const baseHours = toblerTravelTimeHours(horizontalDistM, slope);
      const edgeHours = applyWeatherCorrection(baseHours, weatherFactor);
      const newCost = cost + edgeHours;

      if (newCost < costs[nIdx]) {
        costs[nIdx] = newCost;
        heap.push({ idx: nIdx, cost: newCost });
      }
    }
  }

  return {
    costs,
    gridRadius,
    cellSizeM,
    center: lkp,
    gridSize: size,
    maxSearchHours: opts.maxSearchHours,
    meters,
  };
}

/**
 * 누적 시간 임계값 이내 셀의 외곽 경계를 GeoJSON Polygon으로 변환
 */
function costsToPolygon(surface) {
  const { costs, gridRadius, cellSizeM, center, gridSize, maxSearchHours, meters } = surface;
  const [centerLng, centerLat] = center;
  const reachable = new Set();

  for (let i = 0; i < costs.length; i++) {
    if (costs[i] <= maxSearchHours) reachable.add(i);
  }

  if (reachable.size < 3) {
    return null;
  }

  const boundaryPoints = [];

  for (const idx of reachable) {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const r = row - gridRadius;
    const c = col - gridRadius;

    const corners = [
      [r - 0.5, c - 0.5],
      [r - 0.5, c + 0.5],
      [r + 0.5, c + 0.5],
      [r + 0.5, c - 0.5],
    ];

    for (let e = 0; e < 4; e++) {
      const [r1, c1] = corners[e];
      const [r2, c2] = corners[(e + 1) % 4];
      const midR = (r1 + r2) / 2;
      const midC = (c1 + c2) / 2;
      const nRow = Math.round(midR + gridRadius);
      const nCol = Math.round(midC + gridRadius);

      if (nRow < 0 || nRow >= gridSize || nCol < 0 || nCol >= gridSize) {
        const [lng, lat] = cellToLngLat(midR, midC, centerLng, centerLat, cellSizeM, meters);
        boundaryPoints.push([lng, lat]);
        continue;
      }

      const neighborIdx = nRow * gridSize + nCol;
      if (!reachable.has(neighborIdx)) {
        const [lng, lat] = cellToLngLat(midR, midC, centerLng, centerLat, cellSizeM, meters);
        boundaryPoints.push([lng, lat]);
      }
    }
  }

  if (boundaryPoints.length < 3) {
    for (const idx of reachable) {
      const row = Math.floor(idx / gridSize);
      const col = idx % gridSize;
      const r = row - gridRadius;
      const c = col - gridRadius;
      const [lng, lat] = cellToLngLat(r, c, centerLng, centerLat, cellSizeM, meters);
      boundaryPoints.push([lng, lat]);
    }
  }

  const hull = convexHull(boundaryPoints);
  if (hull.length < 3) return null;

  hull.push(hull[0]);

  return {
    type: 'Feature',
    properties: {
      maxSearchHours,
      algorithm: 'dijkstra-tobler-v0.7',
      lkp: center,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [hull],
    },
  };
}

/**
 * Graham scan 볼록 껍질
 */
function convexHull(points) {
  if (points.length <= 3) return [...points];

  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * LKP 기준 우선 수색구간 GeoJSON Polygon 계산 (메인 API)
 * @param {[number, number]} lkp - [lng, lat]
 * @param {object} [options]
 * @returns {import('geojson').Feature<import('geojson').Polygon>|null}
 */
export function computeSearchPolygon(lkp, options = {}) {
  const surface = dijkstraCostSurface(lkp, options);
  return costsToPolygon(surface);
}

export { DEFAULT_OPTIONS };
