/**
 * 집 짓기 시각화 — 고품질 일러스트 스타일 공사 현장
 * 단계별로 집이 실제로 완성되는 모습을 누적 렌더링
 */
const HouseVisual = (function () {
  'use strict';

  const PHASE_LABELS = [
    '기획안',
    '땅 조사',
    '설계도',
    '자재 준비',
    '기초 공사',
    '뼈대 세우기',
    '내부 공사',
    '외관 마무리',
    '수도·전기',
    '입주·유지보수'
  ];

  /** 공통 SVG 리소스 — 그라데이션·필터·패턴 */
  function sharedDefs() {
    return `
      <defs>
        <linearGradient id="skyTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5b8fd9"/>
          <stop offset="45%" stop-color="#9ec5e8"/>
          <stop offset="100%" stop-color="#f0e4d4"/>
        </linearGradient>
        <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff8dc"/>
          <stop offset="100%" stop-color="#ffc857"/>
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7a9e8a"/>
          <stop offset="100%" stop-color="#5a7e6a"/>
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8fb08a"/>
          <stop offset="100%" stop-color="#6a9068"/>
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8ec872"/>
          <stop offset="60%" stop-color="#6aad58"/>
          <stop offset="100%" stop-color="#4a8d48"/>
        </linearGradient>
        <linearGradient id="grassDark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#5a9a48"/>
          <stop offset="50%" stop-color="#6aad58"/>
          <stop offset="100%" stop-color="#5a9a48"/>
        </linearGradient>
        <linearGradient id="concrete" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b8b8b0"/>
          <stop offset="100%" stop-color="#8a8a82"/>
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#c4a574"/>
          <stop offset="50%" stop-color="#e8c896"/>
          <stop offset="100%" stop-color="#b8956a"/>
        </linearGradient>
        <linearGradient id="woodDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a08050"/>
          <stop offset="100%" stop-color="#806040"/>
        </linearGradient>
        <linearGradient id="wallCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#faf6ee"/>
          <stop offset="100%" stop-color="#e8dcc8"/>
        </linearGradient>
        <linearGradient id="roofOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e8954a"/>
          <stop offset="100%" stop-color="#c45c38"/>
        </linearGradient>
        <linearGradient id="roofShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="windowGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#b8e0f0"/>
          <stop offset="40%" stop-color="#88cce8"/>
          <stop offset="100%" stop-color="#5aa8d0"/>
        </linearGradient>
        <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe8a0"/>
          <stop offset="100%" stop-color="#ffc857" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="doorGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5a9c68"/>
          <stop offset="100%" stop-color="#3a7c48"/>
        </linearGradient>
        <linearGradient id="pipeWater" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4a90d9"/>
          <stop offset="100%" stop-color="#2a70b9"/>
        </linearGradient>
        <linearGradient id="pipeElectric" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffd54a"/>
          <stop offset="100%" stop-color="#f0a030"/>
        </linearGradient>
        <linearGradient id="blueprintGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4a90d9" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#4a90d9" stop-opacity="0.1"/>
        </linearGradient>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f0ebe0"/>
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#2a3a2a" flood-opacity="0.25"/>
        </filter>
        <filter id="deepShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="4" dy="8" stdDeviation="8" flood-color="#1a2a1a" flood-opacity="0.35"/>
        </filter>
        <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowWarm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <pattern id="brick" width="12" height="8" patternUnits="userSpaceOnUse">
          <rect width="12" height="8" fill="#c46850"/>
          <rect x="0" y="0" width="5" height="3.5" fill="#d47860"/>
          <rect x="6" y="4" width="5" height="3.5" fill="#d47860"/>
        </pattern>
        <pattern id="rebar" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="4" x2="8" y2="4" stroke="#6a6a62" stroke-width="1"/>
          <line x1="4" y1="0" x2="4" y2="8" stroke="#6a6a62" stroke-width="1"/>
        </pattern>
      </defs>
    `;
  }

  /** 배경 — 하늘·태양·구름·언덕·잔디 */
  function layerBackground() {
    return `
      <g class="layer-bg">
        <rect width="720" height="420" fill="url(#skyTop)"/>
        <circle cx="580" cy="72" r="42" fill="url(#sunGlow)" class="scene-sun"/>
        <circle cx="580" cy="72" r="55" fill="#ffc857" opacity="0.15" class="scene-sun-halo"/>
        <ellipse cx="120" cy="58" rx="48" ry="18" fill="#fff" opacity="0.85" class="scene-cloud scene-cloud-1"/>
        <ellipse cx="155" cy="52" rx="32" ry="14" fill="#fff" opacity="0.7"/>
        <ellipse cx="400" cy="45" rx="56" ry="20" fill="#fff" opacity="0.8" class="scene-cloud scene-cloud-2"/>
        <ellipse cx="440" cy="38" rx="36" ry="14" fill="#fff" opacity="0.65"/>
        <path d="M0 260 Q180 220 360 250 T720 240 L720 420 L0 420 Z" fill="url(#hillFar)" opacity="0.6"/>
        <path d="M0 290 Q200 255 400 275 T720 265 L720 420 L0 420 Z" fill="url(#hillNear)" opacity="0.75"/>
        <rect x="0" y="310" width="720" height="110" fill="url(#grass)"/>
        <rect x="0" y="310" width="720" height="20" fill="url(#grassDark)" opacity="0.3"/>
        <ellipse cx="360" cy="318" rx="200" ry="12" fill="#4a8d48" opacity="0.4"/>
      </g>
    `;
  }

  /** 공사 현장 펜스 (4단계 이후) */
  function layerSiteFence(show) {
    if (!show) return '';
    return `
      <g class="layer-fence" filter="url(#softShadow)">
        <line x1="80" y1="310" x2="80" y2="270" stroke="#8a8a82" stroke-width="3"/>
        <line x1="640" y1="310" x2="640" y2="270" stroke="#8a8a82" stroke-width="3"/>
        <line x1="80" y1="285" x2="640" y2="285" stroke="#f0c040" stroke-width="2" stroke-dasharray="8 6"/>
        <text x="360" y="278" text-anchor="middle" font-size="11" fill="#8a7a5a" font-weight="600">공사 현장</text>
      </g>
    `;
  }

  /** 1: 기획안 */
  function layerPlanning() {
    return `
      <g class="layer-planning">
        <g filter="url(#deepShadow)" transform="translate(200, 95)">
          <rect x="0" y="0" width="140" height="175" rx="6" fill="url(#paper)"/>
          <rect x="0" y="0" width="140" height="28" rx="6" fill="#4a7c59"/>
          <rect x="0" y="22" width="140" height="6" fill="#4a7c59"/>
          <text x="70" y="19" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">기획안</text>
          <line x1="16" y1="42" x2="124" y2="42" stroke="#d0ccc0" stroke-width="2"/>
          <line x1="16" y1="56" x2="110" y2="56" stroke="#d0ccc0" stroke-width="2"/>
          <line x1="16" y1="70" x2="118" y2="70" stroke="#d0ccc0" stroke-width="2"/>
          <text x="70" y="92" text-anchor="middle" font-size="10" fill="#8a9a8a">목표: 작은 집부터</text>
          <polygon points="70,108 48,138 92,138" fill="none" stroke="#e8954a" stroke-width="2.5"/>
          <rect x="54" y="138" width="32" height="28" fill="none" stroke="#e8954a" stroke-width="2.5"/>
          <rect x="62" y="150" width="10" height="14" fill="#4a7c59" opacity="0.6"/>
        </g>
        <g class="scene-worker" transform="translate(130, 248)">
          <ellipse cx="22" cy="52" rx="28" ry="6" fill="#000" opacity="0.12"/>
          <rect x="14" y="32" width="16" height="22" rx="3" fill="#4a7c59"/>
          <circle cx="22" cy="22" r="14" fill="#f0c896"/>
          <rect x="10" y="8" width="24" height="8" rx="2" fill="#5a5a5a"/>
        </g>
        <text x="360" y="355" text-anchor="middle" font-size="13" fill="#3a5a3a" font-weight="600">빈 부지 — 어떤 집을 지울까?</text>
      </g>
    `;
  }

  /** 2: 땅 조사 */
  function layerSurvey() {
    return `
      <g class="layer-survey">
        <g filter="url(#glowBlue)">
          <line x1="180" y1="310" x2="180" y2="220" stroke="#6b8cae" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>
          <line x1="520" y1="310" x2="520" y2="220" stroke="#6b8cae" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>
          <line x1="180" y1="265" x2="520" y2="265" stroke="#4a90d9" stroke-width="2" stroke-dasharray="8 5"/>
          <circle cx="350" cy="285" r="22" fill="none" stroke="#4a90d9" stroke-width="2" opacity="0.7"/>
        </g>
        <g transform="translate(340, 200)" filter="url(#softShadow)">
          <line x1="10" y1="80" x2="10" y2="0" stroke="#5a5a5a" stroke-width="3"/>
          <circle cx="10" cy="0" r="6" fill="#4a90d9"/>
          <rect x="0" y="75" width="20" height="8" fill="#5a5a5a"/>
        </g>
        <text x="350" y="258" text-anchor="middle" font-size="11" fill="#4a90d9" font-weight="bold">측량 · 환경 조사</text>
      </g>
    `;
  }

  /** 3: 설계도 */
  function layerBlueprint() {
    return `
      <g class="layer-blueprint">
        <rect x="220" y="175" width="280" height="140" rx="4" fill="url(#blueprintGlow)" class="blueprint-pulse"/>
        <g stroke="#4a90d9" stroke-width="2" fill="none" opacity="0.9" filter="url(#glowBlue)">
          <rect x="240" y="195" width="240" height="110" stroke-dasharray="6 4"/>
          <line x1="360" y1="195" x2="360" y2="305"/>
          <line x1="240" y1="250" x2="480" y2="250"/>
          <rect x="255" y="205" width="70" height="45" rx="2"/>
          <text x="290" y="232" text-anchor="middle" font-size="11" fill="#4a90d9">안방</text>
          <rect x="385" y="205" width="70" height="45" rx="2"/>
          <text x="420" y="232" text-anchor="middle" font-size="11" fill="#4a90d9">거실</text>
          <rect x="255" y="260" width="140" height="40" rx="2"/>
          <text x="325" y="285" text-anchor="middle" font-size="11" fill="#4a90d9">주방</text>
          <rect x="350" y="230" width="20" height="35" rx="1"/>
        </g>
        <text x="360" y="168" text-anchor="middle" font-size="12" fill="#4a90d9" font-weight="bold">설계도 — 방·문·창문 배치</text>
      </g>
    `;
  }

  /** 4: 자재 */
  function layerMaterials() {
    return `
      <g class="layer-materials">
        <g transform="translate(60, 255)" filter="url(#deepShadow)">
          <rect x="0" y="20" width="70" height="10" fill="url(#wood)" transform="rotate(-8 35 25)"/>
          <rect x="5" y="28" width="70" height="10" fill="url(#woodDark)" transform="rotate(-5 40 33)"/>
          <rect x="10" y="36" width="70" height="10" fill="url(#wood)"/>
          <rect x="15" y="44" width="70" height="10" fill="url(#woodDark)" transform="rotate(3 50 49)"/>
        </g>
        <g transform="translate(580, 258)" filter="url(#deepShadow)">
          <rect x="0" y="0" width="55" height="35" fill="url(#brick)" rx="2"/>
          <rect x="8" y="38" width="55" height="35" fill="url(#brick)" rx="2"/>
          <rect x="30" y="15" width="40" height="6" fill="#8a8a82" transform="rotate(45 50 18)"/>
          <rect x="45" y="5" width="12" height="8" fill="#6b8cae"/>
        </g>
        <g transform="translate(100, 268)">
          <rect x="0" y="0" width="24" height="30" rx="3" fill="#e8954a" filter="url(#softShadow)"/>
          <rect x="6" y="6" width="12" height="18" fill="#fff" opacity="0.5"/>
        </g>
      </g>
    `;
  }

  /** 5: 기초 */
  function layerFoundation() {
    return `
      <g class="layer-foundation" filter="url(#deepShadow)">
        <rect x="250" y="295" width="220" height="28" rx="3" fill="url(#concrete)"/>
        <rect x="255" y="298" width="210" height="22" fill="url(#rebar)" opacity="0.4"/>
        <rect x="258" y="301" width="204" height="4" fill="#fff" opacity="0.2"/>
        <text x="360" y="288" text-anchor="middle" font-size="11" fill="#6a6a62" font-weight="600">콘크리트 기초</text>
      </g>
    `;
  }

  /** 6: 뼈대 — 골조만 */
  function layerFrame() {
    return `
      <g class="layer-frame">
        <g filter="url(#deepShadow)">
          <line x1="270" y1="295" x2="270" y2="155" stroke="url(#wood)" stroke-width="7" stroke-linecap="round"/>
          <line x1="450" y1="295" x2="450" y2="155" stroke="url(#wood)" stroke-width="7" stroke-linecap="round"/>
          <line x1="360" y1="295" x2="360" y2="155" stroke="url(#woodDark)" stroke-width="5" stroke-linecap="round"/>
          <line x1="270" y1="155" x2="450" y2="155" stroke="url(#wood)" stroke-width="6" stroke-linecap="round"/>
          <line x1="270" y1="155" x2="360" y2="95" stroke="url(#wood)" stroke-width="6" stroke-linecap="round"/>
          <line x1="450" y1="155" x2="360" y2="95" stroke="url(#wood)" stroke-width="6" stroke-linecap="round"/>
          <line x1="360" y1="95" x2="360" y2="78" stroke="url(#woodDark)" stroke-width="4"/>
          <line x1="270" y1="225" x2="450" y2="225" stroke="url(#woodDark)" stroke-width="4" stroke-linecap="round"/>
        </g>
        <text x="360" y="130" text-anchor="middle" font-size="12" fill="#8a6a4a" font-weight="bold">뼈대(골조) 세우기</text>
        <g class="scene-dust">
          <circle cx="300" cy="200" r="2" fill="#c4a574" opacity="0.6"/>
          <circle cx="380" cy="190" r="1.5" fill="#c4a574" opacity="0.5"/>
          <circle cx="420" cy="210" r="2" fill="#c4a574" opacity="0.4"/>
        </g>
      </g>
    `;
  }

  /** 7: 내부 */
  function layerInterior() {
    return `
      <g class="layer-interior" filter="url(#deepShadow)">
        <rect x="272" y="158" width="176" height="147" fill="url(#wallCream)" stroke="#8a7a6a" stroke-width="2"/>
        <line x1="360" y1="158" x2="360" y2="305" stroke="#c8b8a8" stroke-width="2"/>
        <line x1="272" y1="225" x2="448" y2="225" stroke="#c8b8a8" stroke-width="1"/>
        <rect x="340" y="248" width="28" height="42" fill="#b8a898" stroke="#8a7a6a" stroke-width="1"/>
        <rect x="295" y="175" width="28" height="22" rx="2" fill="url(#windowGlass)" stroke="#6a8a9a" stroke-width="1.5"/>
        <rect x="385" y="175" width="28" height="22" rx="2" fill="url(#windowGlass)" stroke="#6a8a9a" stroke-width="1.5"/>
        <rect x="300" y="238" width="35" height="14" rx="2" fill="#a8c8a8" stroke="#7a9a7a" stroke-width="1"/>
        <rect x="385" y="235" width="40" height="20" rx="3" fill="#8a9a8a" stroke="#6a7a6a" stroke-width="1"/>
        <text x="310" y="248" font-size="8" fill="#5a6a5a">침대</text>
        <text x="400" y="250" font-size="8" fill="#fff">소파</text>
        <text x="360" y="148" text-anchor="middle" font-size="11" fill="#6a5a4a" font-weight="600">내부 · 방 나누기</text>
      </g>
    `;
  }

  /** 8: 외관 */
  function layerExterior() {
    return `
      <g class="layer-exterior">
        <polygon points="360,78 258,158 462,158" fill="url(#roofOrange)" filter="url(#deepShadow)"/>
        <polygon points="360,88 268,158 452,158" fill="url(#roofShine)"/>
        <rect x="272" y="158" width="176" height="147" fill="url(#wallCream)" stroke="#d4c4b0" stroke-width="2" filter="url(#softShadow)"/>
        <line x1="360" y1="158" x2="360" y2="305" stroke="#e0d0c0" stroke-width="1"/>
        <rect x="340" y="248" width="28" height="42" rx="2" fill="url(#doorGreen)" stroke="#2a5c38" stroke-width="1.5"/>
        <circle cx="364" cy="272" r="2.5" fill="#ffd54a"/>
        <rect x="295" y="175" width="28" height="22" rx="2" fill="url(#windowGlass)" stroke="#5a8ab0" stroke-width="2"/>
        <line x1="309" y1="175" x2="309" y2="197" stroke="#5a8ab0" stroke-width="1"/>
        <line x1="295" y1="186" x2="323" y2="186" stroke="#5a8ab0" stroke-width="1"/>
        <rect x="385" y="175" width="28" height="22" rx="2" fill="url(#windowGlass)" stroke="#5a8ab0" stroke-width="2"/>
        <line x1="399" y1="175" x2="399" y2="197" stroke="#5a8ab0" stroke-width="1"/>
        <line x1="385" y1="186" x2="413" y2="186" stroke="#5a8ab0" stroke-width="1"/>
        <rect x="310" y="305" width="100" height="8" rx="2" fill="#b8a898"/>
        <ellipse cx="200" cy="310" rx="22" ry="10" fill="#5a9a48"/>
        <ellipse cx="230" cy="315" rx="18" ry="8" fill="#6aad58"/>
        <ellipse cx="520" cy="312" rx="20" ry="9" fill="#5a9a48"/>
        <text x="360" y="68" text-anchor="middle" font-size="11" fill="#c45c38" font-weight="bold">외관 · 페인트 · 마무리</text>
      </g>
    `;
  }

  /** 9: 수도·전기 */
  function layerUtilities() {
    return `
      <g class="layer-utilities">
        <path d="M 348 305 L 348 340 L 120 340 L 120 365" fill="none" stroke="url(#pipeWater)" stroke-width="5" stroke-linecap="round" class="pipe-flow-water" filter="url(#glowBlue)"/>
        <path d="M 372 305 L 372 340 L 600 340 L 600 365" fill="none" stroke="url(#pipeElectric)" stroke-width="5" stroke-linecap="round" class="pipe-flow-electric" filter="url(#glowWarm)"/>
        <rect x="95" y="358" width="50" height="32" rx="4" fill="#5c8aaa" stroke="#4a6a8a" stroke-width="2" filter="url(#softShadow)"/>
        <text x="120" y="378" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">수도</text>
        <rect x="575" y="358" width="50" height="32" rx="4" fill="#7b68ae" stroke="#5a489e" stroke-width="2" filter="url(#softShadow)"/>
        <text x="600" y="372" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">서버</text>
        <text x="600" y="383" text-anchor="middle" font-size="7" fill="#e0d0ff">DB</text>
        <circle cx="348" cy="305" r="5" fill="#4a90d9" class="pipe-node"/>
        <circle cx="372" cy="305" r="5" fill="#ffc857" class="pipe-node"/>
      </g>
    `;
  }

  /** 10: 완성 */
  function layerComplete() {
    return `
      <g class="layer-complete">
        <line x1="360" y1="78" x2="360" y2="55" stroke="#5a5a5a" stroke-width="2"/>
        <polygon points="360,55 378,62 360,69" fill="#4a7c59"/>
        <rect x="300" y="62" width="120" height="26" rx="6" fill="#4a7c59" filter="url(#softShadow)"/>
        <text x="360" y="80" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">입주 환영!</text>
        <rect x="295" y="175" width="28" height="22" rx="2" fill="url(#windowGlow)" opacity="0.5"/>
        <rect x="385" y="175" width="28" height="22" rx="2" fill="url(#windowGlow)" opacity="0.5"/>
        <g class="scene-family">
          <ellipse cx="200" cy="318" rx="24" ry="5" fill="#000" opacity="0.1"/>
          <circle cx="200" cy="298" r="11" fill="#f0c896"/>
          <rect x="193" y="309" width="14" height="16" rx="2" fill="#6b8cae"/>
          <ellipse cx="520" cy="318" rx="24" ry="5" fill="#000" opacity="0.1"/>
          <circle cx="512" cy="298" r="11" fill="#f0c896"/>
          <circle cx="528" cy="300" r="9" fill="#f0c896"/>
          <rect x="505" y="309" width="14" height="16" rx="2" fill="#c45c4a"/>
          <rect x="521" y="311" width="12" height="14" rx="2" fill="#e8954a"/>
        </g>
        <text x="360" y="340" text-anchor="middle" font-size="12" fill="#3a7c48" font-weight="bold">✓ 검사 완료 · 입주 · 유지보수</text>
      </g>
    `;
  }

  /** 크레인 (6~8단계) */
  function layerCrane(show) {
    if (!show) return '';
    return `
      <g class="layer-crane scene-crane" transform="translate(520, 120)">
        <line x1="0" y1="180" x2="0" y2="0" stroke="#f0c040" stroke-width="5"/>
        <line x1="0" y1="20" x2="80" y2="20" stroke="#f0c040" stroke-width="4"/>
        <line x1="80" y1="20" x2="80" y2="60" stroke="#8a8a82" stroke-width="2"/>
        <polygon points="0,180 -15,195 15,195" fill="#5a5a5a"/>
      </g>
    `;
  }

  const LAYERS = [
    layerPlanning,
    layerSurvey,
    layerBlueprint,
    layerMaterials,
    layerFoundation,
    layerFrame,
    layerInterior,
    layerExterior,
    layerUtilities,
    layerComplete
  ];

  /** SVG 본문 조립 */
  function buildSvgBody(upToStep, highlightStep) {
    const step = Math.max(0, Math.min(10, upToStep));
    let body = sharedDefs() + layerBackground();

    if (step >= 4) body += layerSiteFence(true);
    if (step >= 6 && step <= 8) body += layerCrane(true);

    for (let i = 0; i < LAYERS.length; i++) {
      const phaseNum = i + 1;
      if (phaseNum <= step) {
        const layerHtml = LAYERS[i]();
        if (highlightStep === phaseNum) {
          body += layerHtml.replace(/<g class="/, '<g class="layer-highlight ');
        } else {
          body += layerHtml;
        }
      }
    }

    return body;
  }

  /** 장면 래퍼 — 분위기 레이어 + SVG */
  function wrapScene(svgInner, label) {
    return `
      <div class="construction-scene-wrap" role="img" aria-label="${label}">
        <div class="scene-atmosphere" aria-hidden="true"></div>
        <div class="scene-light-rays" aria-hidden="true"></div>
        <svg viewBox="0 0 720 420" class="construction-svg" preserveAspectRatio="xMidYMid slice">
          ${svgInner}
        </svg>
        <div class="scene-vignette" aria-hidden="true"></div>
        <div class="scene-ground-fog" aria-hidden="true"></div>
      </div>
    `;
  }

  function createConstructionScene(upToStep, highlightStep) {
    const step = Math.max(0, Math.min(10, upToStep));
    const label = step > 0
      ? PHASE_LABELS[step - 1] + ' 단계까지 진행된 집 공사 현장'
      : '빈 공사 부지';
    return wrapScene(buildSvgBody(step, highlightStep), label);
  }

  function createTimeline(currentStep, completedSteps) {
    let html = '<ol class="construction-timeline" aria-label="집 짓기 공정">';
    for (let i = 1; i <= 10; i++) {
      const done = completedSteps.includes(i);
      const current = i === currentStep;
      const classes = ['timeline-item'];
      if (done) classes.push('done');
      if (current) classes.push('current');
      if (i <= currentStep) classes.push('built');

      html += `
        <li class="${classes.join(' ')}">
          <span class="timeline-dot" aria-hidden="true">${i}</span>
          <span class="timeline-label">${PHASE_LABELS[i - 1]}</span>
        </li>
      `;
    }
    html += '</ol>';
    return html;
  }

  function createEmptySite() {
    return createConstructionScene(0, 0);
  }

  function createFinishedSite() {
    return createConstructionScene(10, 10);
  }

  return {
    PHASE_LABELS,
    createConstructionScene,
    createTimeline,
    createEmptySite,
    createFinishedSite
  };
})();

if (typeof window !== 'undefined') {
  window.HouseVisual = HouseVisual;
}
