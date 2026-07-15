import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FormField from '../components/FormField';
import ProfilePreview from '../components/ProfilePreview';
import { useProfile } from '../context/ProfileContext';
import { shareVCardFile } from '../services/contacts';
import { colors, spacing } from '../theme';
import { validateProfile } from '../utils/vcard';

const FIELDS = [
  { key: 'fullName', label: '이름', required: true, placeholder: '홍길동' },
  { key: 'company', label: '회사', placeholder: '주식회사 예시' },
  { key: 'title', label: '직함', placeholder: '대표이사' },
  { key: 'phone', label: '전화번호', placeholder: '010-1234-5678', keyboardType: 'phone-pad' },
  { key: 'email', label: '이메일', placeholder: 'name@example.com', keyboardType: 'email-address' },
  { key: 'website', label: '웹사이트', placeholder: 'https://example.com', keyboardType: 'url' },
  { key: 'address', label: '주소', placeholder: '서울특별시 강남구' },
  { key: 'note', label: '메모', placeholder: '간단한 소개' },
];

export default function EditCardScreen() {
  const { profile, ready, saveProfile } = useProfile();
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState('명함 정보를 입력하고 저장하세요.');

  useEffect(() => {
    if (ready) {
      setDraft(profile);
    }
  }, [ready, profile]);

  const updateField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const nextProfile = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, String(value || '').trim()]),
    );
    const error = validateProfile(nextProfile);
    if (error) {
      setStatus(error);
      return;
    }

    await saveProfile(nextProfile);
    setDraft(nextProfile);
    setStatus('명함이 이 휴대폰에 저장되었습니다.');
  };

  const handleShare = async () => {
    const nextProfile = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, String(value || '').trim()]),
    );
    const error = validateProfile(nextProfile);
    if (error) {
      setStatus(error);
      return;
    }

    try {
      await shareVCardFile(nextProfile);
      setStatus('명함 파일을 공유했습니다.');
    } catch (err) {
      setStatus(err.message || '공유에 실패했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>명함핑</Text>
        <Text style={styles.title}>내 전자명함</Text>
        <Text style={styles.subtitle}>입력한 정보는 이 휴대폰에 저장되며 NFC 송신에 사용됩니다.</Text>
      </View>

      <View style={styles.form}>
        {FIELDS.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            required={field.required}
            value={draft[field.key] || ''}
            placeholder={field.placeholder}
            keyboardType={field.keyboardType}
            autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
            onChangeText={(value) => updateField(field.key, value)}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={handleSave}>
          <Text style={styles.secondaryButtonText}>명함 저장</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleShare}>
          <Text style={styles.secondaryButtonText}>파일 공유</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>미리보기</Text>
      <ProfilePreview profile={draft} />

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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 22,
  },
  form: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: colors.muted,
    lineHeight: 22,
  },
});
