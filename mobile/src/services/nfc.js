import { Platform } from 'react-native';
import NfcManager, { NfcEvents, NfcTech, Ndef } from 'react-native-nfc-manager';

function bytesToString(bytes) {
  if (!bytes) return '';
  return Ndef.util.bytesToString(bytes);
}

export function parseNdefMessage(ndefMessage) {
  if (!ndefMessage?.length) return null;

  for (const record of ndefMessage) {
    if (record.tnf === Ndef.TNF_MIME_MEDIA) {
      const mimeType = bytesToString(record.type);
      if (mimeType.includes('vcard')) {
        return bytesToString(record.payload);
      }
    }

    if (record.tnf === Ndef.TNF_WELL_KNOWN && bytesToString(record.type) === 'T') {
      const text = Ndef.text.decodePayload(new Uint8Array(record.payload));
      if (text.includes('BEGIN:VCARD')) return text;
    }
  }

  return null;
}

export async function initNfc() {
  const supported = await NfcManager.isSupported();
  if (!supported) return { supported: false, enabled: false };
  await NfcManager.start();
  const enabled = await NfcManager.isEnabled();
  return { supported: true, enabled };
}

export async function openNfcSettings() {
  await NfcManager.goToNfcSetting();
}

function buildNdefBytes(vcard) {
  return Ndef.encodeMessage([
    Ndef.mimeMediaRecord('text/vcard', vcard),
    Ndef.textRecord('전자명함', 'ko'),
  ]);
}

export async function enableAndroidPush(vcard) {
  if (Platform.OS !== 'android') {
    throw new Error('NFC 송신은 Android 앱에서 지원됩니다.');
  }

  const bytes = buildNdefBytes(vcard);
  await NfcManager.setNdefPushMessage(bytes);
}

export async function disableAndroidPush() {
  if (Platform.OS === 'android') {
    await NfcManager.setNdefPushMessage(null);
  }
}

export async function writeVCardToDevice(vcard) {
  const bytes = buildNdefBytes(vcard);

  await NfcManager.requestTechnology(NfcTech.Ndef, {
    alertMessage: '상대방 휴대폰을 가까이 대세요',
  });

  try {
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => undefined);
  }
}

export async function startNfcListener(onVCard) {
  NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
    const vcardText = parseNdefMessage(tag?.ndefMessage);
    if (vcardText) onVCard(vcardText);
  });

  await NfcManager.registerTagEvent({
    alertMessage: '명함이 있는 휴대폰을 가까이 대세요',
    invalidateAfterFirstRead: false,
    isReaderModeEnabled: true,
  });
}

export async function stopNfcListener() {
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
  await NfcManager.unregisterTagEvent().catch(() => undefined);
}
