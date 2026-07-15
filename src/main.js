import './style.css';
import {
  EMPTY_PROFILE,
  loadProfile,
  saveProfile,
  validateProfile,
  downloadVCard,
  shareVCard,
} from './vcard.js';
import { isNfcSupported, writeBusinessCard, scanBusinessCard } from './nfc.js';

const fields = [
  { id: 'fullName', label: '이름', type: 'text', required: true, placeholder: '홍길동' },
  { id: 'company', label: '회사', type: 'text', placeholder: '주식회사 예시' },
  { id: 'title', label: '직함', type: 'text', placeholder: '대표이사' },
  { id: 'phone', label: '전화번호', type: 'tel', placeholder: '010-1234-5678' },
  { id: 'email', label: '이메일', type: 'email', placeholder: 'name@example.com' },
  { id: 'website', label: '웹사이트', type: 'url', placeholder: 'https://example.com' },
  { id: 'address', label: '주소', type: 'text', placeholder: '서울특별시 강남구' },
  { id: 'note', label: '메모', type: 'text', placeholder: '간단한 소개' },
];

let activeAbort = null;
let currentProfile = loadProfile();

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="header">
    <div>
      <p class="eyebrow">명함핑</p>
      <h1>NFC 전자명함</h1>
      <p class="subtitle">휴대폰을 맞대면 명함이 전달되고, 연락처에 바로 저장됩니다.</p>
    </div>
    <div id="nfc-badge" class="badge"></div>
  </header>

  <nav class="tabs" role="tablist" aria-label="전자명함 모드">
    <button class="tab active" data-tab="edit" role="tab" aria-selected="true">내 명함</button>
    <button class="tab" data-tab="send" role="tab" aria-selected="false">NFC 송신</button>
    <button class="tab" data-tab="receive" role="tab" aria-selected="false">NFC 수신</button>
  </nav>

  <main>
    <section class="panel active" data-panel="edit">
      <form id="card-form" class="card-form"></form>
      <div class="actions">
        <button type="button" class="btn secondary" id="save-btn">명함 저장</button>
        <button type="button" class="btn secondary" id="share-btn">파일 공유</button>
      </div>
    </section>

    <section class="panel" data-panel="send">
      <div class="info-card">
        <h2>NFC로 명함 보내기</h2>
        <ol>
          <li>내 명함 정보를 먼저 저장합니다.</li>
          <li>아래 버튼을 누른 뒤 두 휴대폰을 등을 맞대거나 가까이 대세요.</li>
          <li>상대방 휴대폰에서 연락처 추가 화면이 자동으로 열립니다.</li>
        </ol>
        <p class="hint">Android Chrome + NFC 켜짐 상태에서 가장 잘 동작합니다.</p>
      </div>
      <div class="preview" id="send-preview"></div>
      <button type="button" class="btn primary" id="send-btn">NFC 명함 전송 시작</button>
      <button type="button" class="btn ghost hidden" id="cancel-send-btn">전송 취소</button>
    </section>

    <section class="panel" data-panel="receive">
      <div class="info-card">
        <h2>NFC로 명함 받기</h2>
        <p>수신 대기 중 상대방 휴대폰에서 명함을 내면 아래에 표시됩니다.</p>
      </div>
      <div class="preview empty" id="receive-preview">아직 수신된 명함이 없습니다.</div>
      <button type="button" class="btn primary" id="receive-btn">NFC 수신 시작</button>
      <button type="button" class="btn ghost hidden" id="cancel-receive-btn">수신 취소</button>
      <button type="button" class="btn secondary hidden" id="save-contact-btn">연락처에 저장</button>
    </section>
  </main>

  <footer class="status" id="status" aria-live="polite">명함 정보를 입력하고 저장하세요.</footer>
`;

const formEl = document.querySelector('#card-form');
const statusEl = document.querySelector('#status');
const nfcBadgeEl = document.querySelector('#nfc-badge');
const sendPreviewEl = document.querySelector('#send-preview');
const receivePreviewEl = document.querySelector('#receive-preview');
const saveContactBtn = document.querySelector('#save-contact-btn');

let receivedProfile = null;

function setStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.dataset.type = type;
}

function renderForm() {
  formEl.innerHTML = fields
    .map(
      (field) => `
        <label class="field">
          <span>${field.label}${field.required ? ' *' : ''}</span>
          <input
            id="${field.id}"
            name="${field.id}"
            type="${field.type}"
            placeholder="${field.placeholder}"
            value="${escapeHtml(currentProfile[field.id] || '')}"
            ${field.required ? 'required' : ''}
          />
        </label>
      `,
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readFormProfile() {
  const profile = { ...EMPTY_PROFILE };

  for (const field of fields) {
    const input = formEl.elements[field.id];
    profile[field.id] = input?.value.trim() || '';
  }

  return profile;
}

function renderPreview(profile, targetEl) {
  const rows = [
    ['이름', profile.fullName],
    ['회사', profile.company],
    ['직함', profile.title],
    ['전화', profile.phone],
    ['이메일', profile.email],
    ['웹사이트', profile.website],
    ['주소', profile.address],
    ['메모', profile.note],
  ].filter(([, value]) => value);

  if (!rows.length) {
    targetEl.className = 'preview empty';
    targetEl.textContent = '표시할 명함 정보가 없습니다.';
    return;
  }

  targetEl.className = 'preview';
  targetEl.innerHTML = rows
    .map(([label, value]) => `<div><strong>${label}</strong><span>${escapeHtml(value)}</span></div>`)
    .join('');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });

  if (tabName === 'send') {
    renderPreview(currentProfile, sendPreviewEl);
  }
}

function stopActiveOperation() {
  activeAbort?.abort();
  activeAbort = null;
  document.querySelector('#cancel-send-btn').classList.add('hidden');
  document.querySelector('#cancel-receive-btn').classList.add('hidden');
}

function updateNfcBadge() {
  if (isNfcSupported()) {
    nfcBadgeEl.textContent = 'NFC 지원';
    nfcBadgeEl.className = 'badge ok';
    return;
  }

  nfcBadgeEl.textContent = 'NFC 미지원';
  nfcBadgeEl.className = 'badge warn';
}

renderForm();
renderPreview(currentProfile, sendPreviewEl);
updateNfcBadge();

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    stopActiveOperation();
    switchTab(tab.dataset.tab);
  });
});

document.querySelector('#save-btn').addEventListener('click', () => {
  const profile = readFormProfile();
  const error = validateProfile(profile);

  if (error) {
    setStatus(error, 'error');
    return;
  }

  currentProfile = profile;
  saveProfile(profile);
  renderPreview(currentProfile, sendPreviewEl);
  setStatus('명함이 이 기기에 저장되었습니다.', 'success');
});

document.querySelector('#share-btn').addEventListener('click', async () => {
  const profile = readFormProfile();
  const error = validateProfile(profile);

  if (error) {
    setStatus(error, 'error');
    return;
  }

  try {
    const shared = await shareVCard(profile);
    setStatus(
      shared ? '명함 파일을 공유했습니다.' : '명함 .vcf 파일을 다운로드했습니다.',
      'success',
    );
  } catch (err) {
    if (err.name !== 'AbortError') {
      setStatus(err.message || '공유에 실패했습니다.', 'error');
    }
  }
});

document.querySelector('#send-btn').addEventListener('click', async () => {
  const profile = readFormProfile();
  const error = validateProfile(profile);

  if (error) {
    setStatus(error, 'error');
    switchTab('edit');
    return;
  }

  currentProfile = profile;
  saveProfile(profile);
  renderPreview(currentProfile, sendPreviewEl);

  stopActiveOperation();
  activeAbort = new AbortController();

  document.querySelector('#cancel-send-btn').classList.remove('hidden');

  try {
    await writeBusinessCard(profile, {
      signal: activeAbort.signal,
      onStatus: setStatus,
    });
    setStatus('명함 전송이 완료되었습니다. 상대방 화면을 확인하세요.', 'success');
  } catch (err) {
    if (err.name === 'AbortError') {
      setStatus('NFC 전송을 취소했습니다.');
      return;
    }
    setStatus(err.message || 'NFC 전송에 실패했습니다.', 'error');
  } finally {
    document.querySelector('#cancel-send-btn').classList.add('hidden');
    activeAbort = null;
  }
});

document.querySelector('#cancel-send-btn').addEventListener('click', () => {
  stopActiveOperation();
  setStatus('NFC 전송을 취소했습니다.');
});

document.querySelector('#receive-btn').addEventListener('click', async () => {
  stopActiveOperation();
  activeAbort = new AbortController();
  receivedProfile = null;
  saveContactBtn.classList.add('hidden');

  document.querySelector('#cancel-receive-btn').classList.remove('hidden');

  try {
    await scanBusinessCard({
      signal: activeAbort.signal,
      onStatus: setStatus,
      onCard: (profile) => {
        receivedProfile = profile;
        renderPreview(profile, receivePreviewEl);
        saveContactBtn.classList.remove('hidden');
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      setStatus('NFC 수신을 취소했습니다.');
      return;
    }
    setStatus(err.message || 'NFC 수신에 실패했습니다.', 'error');
  } finally {
    document.querySelector('#cancel-receive-btn').classList.add('hidden');
    activeAbort = null;
  }
});

document.querySelector('#cancel-receive-btn').addEventListener('click', () => {
  stopActiveOperation();
  setStatus('NFC 수신을 취소했습니다.');
});

document.querySelector('#save-contact-btn').addEventListener('click', async () => {
  if (!receivedProfile) return;

  try {
    const shared = await shareVCard(receivedProfile);
    if (!shared) {
      downloadVCard(receivedProfile);
    }
    setStatus('연락처 앱에서 명함을 저장하세요. (자동 저장 화면이 열립니다)', 'success');
  } catch (err) {
    if (err.name !== 'AbortError') {
      setStatus(err.message || '연락처 저장에 실패했습니다.', 'error');
    }
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('Service Worker 등록 실패:', err);
    });
  });
}
