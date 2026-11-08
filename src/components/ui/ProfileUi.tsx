import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { colors, radius, typography } from '../../theme';
import type { AccountProfile } from '../../types/profile';

type IconName = ComponentProps<typeof Feather>['name'];

export function ProfileAvatar({ profile, size, camera = false }: { profile: AccountProfile; size: number; camera?: boolean }) {
  const names = profile.fullName.trim().split(/\s+/).filter(Boolean);
  const initials = names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : names.length ? names[0].slice(0, 2).toUpperCase() : 'SV';
  return <View style={{ width: size, height: size }}>
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {profile.avatarUri ? <Image source={{ uri: profile.avatarUri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" /> : <Text style={[styles.initials, { fontSize: size * 0.3 }]}>{initials}</Text>}
    </View>
    {camera ? <View style={styles.camera}><Feather name="camera" size={13} color={colors.surface} /></View> : null}
  </View>;
}

export function ProfileMenuRow({ icon, title, subtitle, onPress, last = false, accent = false }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; last?: boolean; accent?: boolean }) {
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={[styles.row, !last && styles.border]}>
    <View style={styles.iconBox}><Feather name={icon} size={19} color={colors.textSecondary} /></View>
    <YStack style={styles.rowCopy}>
      <TamaText style={[styles.rowTitle, accent && styles.accent]}>{title}</TamaText>
      {subtitle ? <TamaText style={styles.rowSubtitle}>{subtitle}</TamaText> : null}
    </YStack>
    {onPress ? <Feather name="chevron-right" size={20} color={colors.inactiveTab} /> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: colors.surface, fontFamily: typography.bold },
  camera: { position: 'absolute', right: -1, bottom: -1, width: 25, height: 25, borderRadius: radius.pill, backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  border: { borderBottomWidth: 0.8, borderBottomColor: colors.border },
  iconBox: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fullBackground },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 14 },
  accent: { color: colors.primary },
  rowSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 2 },
});
