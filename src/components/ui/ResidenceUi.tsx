import { Feather } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Text as TamaText, XStack, YStack } from 'tamagui';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';

type Icon = ComponentProps<typeof Feather>['name'];

export function StudentHeader() {
  const auth = useAuth();
  const fullName = auth.status === 'authenticated' ? auth.user.fullName : '';
  const displayName = fullName.trim().split(/\s+/).filter(Boolean).slice(-1)[0] || '';
  return <XStack style={styles.studentHeader}>
    <View style={styles.avatar}><TamaText style={styles.avatarText}>{fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi-VN')}</TamaText></View>
    <YStack style={styles.studentCopy}>
      <TamaText style={styles.studentName}>Xin chào, {displayName} 👋</TamaText>
      <TamaText style={styles.studentDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</TamaText>
    </YStack>
  </XStack>;
}

export function ResidenceHeader({ title, onBack, showBack = true }: { title: string; onBack?: () => void; showBack?: boolean }) { return <XStack style={styles.pageHeader}>{showBack ? <Pressable onPress={onBack} accessibilityLabel="Quay lại" style={styles.back}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable> : null}<TamaText style={styles.pageTitle}>{title}</TamaText></XStack>; }

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { return <XStack style={styles.sectionHeader}><TamaText style={styles.sectionTitle}>{title}</TamaText>{action && onAction ? <Pressable onPress={onAction}><TamaText style={styles.sectionAction}>{action}</TamaText></Pressable> : null}</XStack>; }

export function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <XStack style={[styles.detailRow, !last && styles.detailBorder]}><TamaText style={styles.detailLabel}>{label}</TamaText><TamaText style={styles.detailValue}>{value}</TamaText></XStack>; }

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: object }>) { return <Card size={false} style={[styles.surfaceCard, style]}>{children}</Card>; }

export function IconTile({ icon, label, onPress }: { icon: Icon; label: string; onPress?: () => void }) { return <Pressable style={styles.iconTile} disabled={!onPress} onPress={onPress}><View style={styles.iconBox}><Feather name={icon} size={21} color={colors.primary} /></View><Text style={styles.iconLabel}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  studentHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 22 }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontFamily: typography.bold, fontSize: 15 }, studentCopy: { flex: 1, marginLeft: 10 }, studentName: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, studentDate: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 4 },
  pageHeader: { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border }, back: { width: 25 }, pageTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 }, sectionAction: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 0.8, borderColor: colors.border, padding: 14 }, detailRow: { minHeight: 33, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, detailBorder: { borderBottomWidth: 0.8, borderBottomColor: colors.border }, detailLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, detailValue: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 },
  iconTile: { flex: 1, alignItems: 'center' }, iconBox: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.actionIconBackground }, iconLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 11.5, textAlign: 'center', marginTop: 6 },
});
