import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ProfilePreview from '../components/ProfilePreview';
import { saveProfileToContacts, shareVCardFile } from '../services/contacts';
import { initNfc, openNfcSettings, startNfcListener, stopNfcListener } from '../services/nfc';
import { colors, spacing } from '../theme';
import { parseVCard } from '../utils/vcard';

export default function ReceiveScreen() {
  const [nfcState, setNfcState] = useState({ supported: false, enabled: false });
  const [listening, setListening] = useState(false);
  const [receivedProfile, setReceivedProfile] = useState(null);
  const [status, setStatus] = useState('NFC 수신을 시작하면 상대방 명함을 받을 수 있습니다.');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initNfc().then(setNfcState);
    return () => {
      stopNfcListener().catch(() => undefined);
    };
  }, []);

  const handleStart = async () => {
    if (!nfcState.supported) {
      setStatus('이 기기는 NFC를 지원하지 않습니다.');
      return;
    }

    if (!nfcState.enabled) {
      setStatus('NFC가 꺼져 있습니다. 설정에서 켜 주세요.');
      await openNfcSettings();
      return;
    }

    setListening(true);
    setReceivedProfile(null);
    setStatus('NFC 수신 대기 중… 명함을 휴대폰 뒤쪽에 가까이 대세요.');

    try {
      await startNfcListener((vcardText) => {
        const profile = parseVCard(vcardText);
        setReceivedProfile(profile);
        setStatus(`${profile.fullName || '연락처'} 명함을 수신했습니다.`);
      });
    } catch (err) {
      setListening(false);
      setStatus(err.message || 'NFC 수신을 시작하지 못했습니다.');
    }
  };

  const handleStop = async () => {
    await stopNfcListener();
    setListening(false);
    setStatus('NFC 수신을 중지했습니다.');
  };

  const handleSaveContact = async () => {
    if (!receivedProfile) return;

    setSaving(true);
    try {
      const contactId = await saveProfileToContacts(receivedProfile);
      Alert.alert('저장 완료', '연락처에 명함이 저장되었습니다.');
      setStatus(`연락처 저장 완료 (ID: ${contactId})`);
    } catch (err) {
      setStatus(err.message || '연락처 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareReceived = async () => {
    if (!receivedProfile) return;

    try {
      await shareVCardFile(receivedProfile);
      setStatus('수신한 명함 파일을 공유했습니다.');
    } catch (err) {
      setStatus(err.message || '공유에 실패했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.title}>NFC로 명함 받기</Text>
        <Text style={styles.body}>수신 대기 중 상대방이 명함을 내면 아래에 표시됩니다.</Text>
        <Text style={styles.body}>연락처에 저장 버튼을 누르면 앱이 직접 연락처에 추가합니다.</Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, listening ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>{listening ? '수신 중' : '대기 중'}</Text>
        </View>
      </View>

      <ProfilePreview
        profile={receivedProfile || {}}
        emptyText="아직 수신된 명함이 없습니다."
      />

      {!listening ? (
        <Pressable style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>NFC 수신 시작</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.ghostButton} onPress={handleStop}>
          <Text style={styles.ghostButtonText}>수신 중지</Text>
        </Pressable>
      )}

      {receivedProfile ? (
        <>
          <Pressable style={styles.primaryButton} onPress={handleSaveContact} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#082f49" />
            ) : (
              <Text style={styles.primaryButtonText}>연락처에 저장</Text>
            )}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleShareReceived}>
            <Text style={styles.secondaryButtonText}>명함 파일 공유</Text>
          </Pressable>
        </>
      ) : null}

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
  },
  body: {
    color: colors.muted,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
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
