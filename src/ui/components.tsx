import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space, type } from './theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.textMuted }]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Número grande protagonista. value = null → "—" (sin datos, nunca un 0 inventado). */
export function Stat({ label, value, size = 'stat' }: { label: string; value: string | null; size?: 'stat' | 'hero' }) {
  return (
    <View style={{ gap: space(0.5) }}>
      <Text style={[size === 'hero' ? styles.hero : styles.stat, value === null && { color: colors.textMuted }]}>
        {value ?? '—'}
      </Text>
      <Label>{label}</Label>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'secondary' ? colors.text : colors.accentText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.border },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Notice({ children, tone = 'warning' }: { children: ReactNode; tone?: 'warning' | 'info' }) {
  return (
    <View style={[styles.notice, { borderColor: tone === 'warning' ? colors.warning : colors.border }]}>
      <Text style={[styles.body, { fontSize: 14 }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space(3), gap: space(3) },
  title: { ...type.title, color: colors.text },
  label: { ...type.label, color: colors.textMuted, textTransform: 'uppercase' },
  body: { ...type.body, color: colors.text, lineHeight: 22 },
  hero: { ...type.hero, color: colors.text },
  stat: { ...type.stat, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: space(2.5), gap: space(2) },
  button: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space(3) },
  buttonText: { fontSize: 17, fontWeight: '700' },
  notice: { borderWidth: 1, borderRadius: 12, padding: space(2) },
});
