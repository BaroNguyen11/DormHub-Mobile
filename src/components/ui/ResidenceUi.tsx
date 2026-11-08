import { Feather } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMockAccount } from '../../context/MockAccountContext';
import { colors, radius, typography } from '../../theme';
import { ProfileAvatar } from './ProfileUi';

type Icon = ComponentProps<typeof Feather>['name'];

export function StudentHeader({ onMessage }: { onMessage?: () => void }) {
  const { profile } = useMockAccount();
  const displayName = profile?.fullName.trim().split(/\s+/).filter(Boolean).slice(-1)[0] || profile?.accountId || '';
  return <View style={styles.studentHeader}>
    {profile ? <ProfileAvatar profile={profile} size={44} /> : <View style={styles.avatar} />}
    <View style={styles.studentCopy}>
      <Text style={styles.studentName}>Xin chào, {displayName} 👋</Text>
      <Text style={styles.studentDate}>{new Date().toLocaleDateString('vi-VN')}</Text>
    </View>
    <Pressable accessibilityRole={onMessage ? 'button' : undefined} accessibilityLabel={onMessage ? 'Tin nhắn' : undefined} disabled={!onMessage} onPress={onMessage} style={styles.message}>
      <Feather name="message-circle" size={24} color={colors.text} />
    </Pressable>
  </View>;
}

export function ResidenceHeader({ title, onBack, showBack = true }: { title: string; onBack?: () => void; showBack?: boolean }) { return <View style={styles.pageHeader}>{showBack ? <Pressable onPress={onBack} accessibilityLabel="Quay lại" style={styles.back}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable> : null}<Text style={styles.pageTitle}>{title}</Text></View>; }

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && onAction ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>; }

export function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <View style={[styles.detailRow, !last && styles.detailBorder]}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: object }>) { return <View style={[styles.surfaceCard, style]}>{children}</View>; }


export function IconTile({ icon, label, onPress }: { icon: Icon; label: string; onPress?: () => void }) { return <Pressable style={styles.iconTile} disabled={!onPress} onPress={onPress}><View style={styles.iconBox}><Feather name={icon} size={21} color={colors.primary} /></View><Text style={styles.iconLabel}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  studentHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 22 }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontFamily: typography.bold, fontSize: 15 }, studentCopy: { flex: 1, marginLeft: 10 }, studentName: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, studentDate: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 4 }, message: { width: 35, alignItems: 'center' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, position: 'absolute', top: -2, right: 3 },
  pageHeader: { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border }, back: { width: 25 }, pageTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 }, sectionAction: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 0.8, borderColor: colors.border, padding: 14 }, detailRow: { minHeight: 33, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, detailBorder: { borderBottomWidth: 0.8, borderBottomColor: colors.border }, detailLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, detailValue: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 },
  utilityMini: { flex: 1, minHeight: 108 }, utilityHeading: { flexDirection: 'row', gap: 10, alignItems: 'center' }, utilityLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, utilityValue: { color: colors.text, fontFamily: typography.regular, fontSize: 19, marginTop: 10 }, utilityDelta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, lineHeight: 15, marginTop: 2 }, increase: { color: colors.error },
  iconTile: { flex: 1, alignItems: 'center' }, iconBox: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.actionIconBackground }, iconLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 11.5, textAlign: 'center', marginTop: 6 },
});
