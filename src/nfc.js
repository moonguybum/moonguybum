import { buildVCard, parseVCard } from './vcard.js';

export function isNfcSupported() {
  return 'NDEFReader' in window;
}

function recordToText(record) {
  if (record.recordType === 'text') {
    const decoder = new TextDecoder(record.encoding || 'utf-8');
    return decoder.decode(record.data);
  }

  if (record.recordType === 'mime') {
    const decoder = new TextDecoder();
    return decoder.decode(record.data);
  }

  if (record.recordType === 'url') {
    const decoder = new TextDecoder();
    return decoder.decode(record.data);
  }

  return null;
}

function extractVCardFromMessage(message) {
  for (const record of message.records) {
    if (record.recordType === 'mime' && record.mediaType?.includes('vcard')) {
      const decoder = new TextDecoder();
      return decoder.decode(record.data);
    }

    const text = recordToText(record);
    if (text && text.includes('BEGIN:VCARD')) {
      return text;
    }
  }

  return null;
}

export async function writeBusinessCard(profile, { signal, onStatus } = {}) {
  if (!isNfcSupported()) {
    throw new Error('이 기기/브라우저는 Web NFC를 지원하지 않습니다. Android Chrome을 사용해 주세요.');
  }

  const validationError = profile.fullName.trim()
    ? null
    : '이름을 입력한 뒤 전송해 주세요.';

  if (validationError) {
    throw new Error(validationError);
  }

  const ndef = new NDEFReader();
  const vcard = buildVCard(profile);

  onStatus?.('상대방 휴대폰을 가까이 대고 NFC 전송을 준비합니다…');

  await ndef.write(
    {
      records: [
        {
          recordType: 'mime',
          mediaType: 'text/vcard',
          data: vcard,
        },
        {
          recordType: 'text',
          data: `${profile.fullName.trim()}의 전자명함`,
        },
      ],
    },
    { signal },
  );

  onStatus?.('명함 전송이 완료되었습니다.');
}

export async function scanBusinessCard({ signal, onStatus, onCard } = {}) {
  if (!isNfcSupported()) {
    throw new Error('이 기기/브라우저는 Web NFC를 지원하지 않습니다. Android Chrome을 사용해 주세요.');
  }

  const ndef = new NDEFReader();

  onStatus?.('NFC 수신 대기 중… 명함을 휴대폰에 가까이 대세요.');

  ndef.onreading = (event) => {
    const vcardText = extractVCardFromMessage(event.message);

    if (!vcardText) {
      onStatus?.('NFC 데이터를 읽었지만 명함 형식이 아닙니다.');
      return;
    }

    const profile = parseVCard(vcardText);
    onCard?.(profile);
    onStatus?.(`${profile.fullName || '연락처'} 명함을 수신했습니다.`);
  };

  ndef.onreadingerror = () => {
    onStatus?.('NFC 읽기에 실패했습니다. 다시 시도해 주세요.');
  };

  await ndef.scan({ signal });
}
