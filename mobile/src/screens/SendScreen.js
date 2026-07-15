import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ProfilePreview from '../components/ProfilePreview';
import { useProfile } from '../context/ProfileContext';
import {
  disableAndroidPush,
  enableAndroidPush,
  initNfc,
  openNfcSettings,
  writeVCardToDevice,
} from '../services/nfc';
import { colors, spacing } from '../theme';
import { buildVCard, validateProfile } from '../utils/vcard';

export default function SendScreen() {
  const { profile } = useProfile();
  const [nfcState, setNfcState] = useState({ supported: false, enabled: false });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('명함 정보를 확인한 뒤 전송을 시작하세요.');

  useEffect(() => {
    initNfc().then(setNfcState);
    return () => {
      disableAndroidPush().catch(() => undefined);
    };
  }, []);

  const ensureProfile = () => {
    const error = validateProfile(profile);
    if (error) {
      setStatus(error);
      return null;
    }
    return buildVCard(profile);
  };

  const handleStartPush = async () => {
    const vcard = ensureProfile();
    if (!vcard) return;

    if (!nfcState.supported) {
      setStatus('이 기기는 NFC를 지원하지 않습니다.');
      return;
    }

    if (!nfcState.enabled) {
      setStatus('NFC가 꺼져 있습니다. 설정에서 켜 주세요.');
      await openNfcSettings();
      return;
    }

    setSending(true);
    setStatus('NFC 송신 준비 중… 상대방 휴대폰을 가까이 대세요.');

    try {
      await enableAndroidPush(vcard);
      setStatus('송신 준비 완료. 상대방 휴대폰과 등을 맞대면 연락처 화면이 열립니다.');
    } catch (err) {
      setStatus(err.message || 'NFC 송신 준비에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleTapWrite = async () => {
    const vcard = ensureProfile();
    if (!vcard) return;

    if (!nfcState.supported || !nfcState.enabled) {
      setStatus('NFC를 사용할 수 없습니다.');
      return;
    }

    setSending(true);
    setStatus('상대방 휴대폰을 가까이 대고 있어요…');

    try {
      await writeVCardToDevice(vcard);
      setStatus('명함 전송이 완료되었습니다.');
    } catch (err) {
      setStatus(err.message || '명함 전송에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSending(false);
    }
  };

  const handleStopPush = async () => {
    await disableAndroidPush();
    setStatus('NFC 송신을 중지했습니다.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.title}>NFC로 명함 보내기</Text>
        <Text style={styles.body}>1. 내 명함 정보를 먼저 저장합니다.</Text>
        <Text style={styles.body}>2. 아래 버튼으로 송신을 시작합니다.</Text>
        <Text style={styles.body}>3. 상대방 휴대폰과 가까이 대면 연락처 추가 화면이 열립니다.</Text>
        <Text style={styles.hint}>
          {Platform.OS === 'android'
            ? 'Android 앱에서 NFC 송신이 가장 잘 동작합니다.'
            : 'iPhone은 NFC 송신 대신 파일 공유를 사용해 주세요.'}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, nfcState.supported ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>{nfcState.supported ? 'NFC 지원' : 'NFC 미지원'}</Text>
        </View>
        <View style={[styles.badge, nfcState.enabled ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>{nfcState.enabled ? 'NFC 켜짐' : 'NFC 꺼짐'}</Text>
        </View>
      </View>

      <ProfilePreview profile={profile} />

      {Platform.OS === 'android' ? (
        <>
          <Pressable style={styles.primaryButton} onPress={handleStartPush} disabled={sending}>
            {sending ? <ActivityIndicator color="#082f49" /> : <Text style={styles.primaryButtonText}>NFC 송신 시작</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleTapWrite} disabled={sending}>
            <Text style={styles.secondaryButtonText}>근접 탭 전송</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={handleStopPush}>
            <Text style={styles.ghostButtonText}>송신 중지</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.body}>iPhone에서는 내 명함 탭의 파일 공유 기능을 사용해 주세요.</Text>
      )}

      <Text style={styles.status}>{status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: colors.muted,
    lineHeight: 22,
  },
  hint: {
    color: colors.warning,
    marginTop: 4,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeOk: {
    backgroundColor: 'rgba(74, 222, 128, 0.16)',
  },
  badgeWarn: {
    backgroundColor: 'rgba(251, 191, 36, 0.16)',
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#082f49',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  ghostButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: colors.muted,
    fontWeight: '600',
  },
  status: {
    color: colors.muted,
    lineHeight: 22,
  },
});
