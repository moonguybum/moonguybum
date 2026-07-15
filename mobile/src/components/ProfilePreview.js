import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

const LABELS = [
  ['fullName', '이름'],
  ['company', '회사'],
  ['title', '직함'],
  ['phone', '전화'],
  ['email', '이메일'],
  ['website', '웹사이트'],
  ['address', '주소'],
  ['note', '메모'],
];

export default function ProfilePreview({ profile, emptyText = '표시할 명함 정보가 없습니다.' }) {
  const rows = LABELS.map(([key, label]) => [label, profile[key]]).filter(([, value]) => value);

  if (!rows.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
  },
  row: {
    gap: 4,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
