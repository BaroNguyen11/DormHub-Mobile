import { Feather } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Text as TamaText, XStack, YStack } from 'tamagui';
import { studentProfile, utilityOverview } from '../../mocks/residence';
import { useMockAccount } from '../../context/MockAccountContext';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';
import { ProfileAvatar } from './ProfileUi';

type Icon = ComponentProps<typeof Feather>['name'];

export function StudentHeader({ onMessage }: { onMessage?: () => void }) {
  const { profile } = useMockAccount();
  const auth = useAuth();
  const realName = auth.status === 'authenticated' ? auth.user.fullName : null;
  const displayName = realName?.trim().split(/\s+/).filter(Boolean).slice(-1)[0] || profile?.fullName.trim().split(/\s+/).filter(Boolean).slice(-1)[0] || profile?.accountId || '';
  return <XStack style={styles.studentHeader}>
    {profile ? <ProfileAvatar profile={profile} size={44} /> : <View style={styles.avatar} />}
    <YStack style={styles.studentCopy}>
      <TamaText style={styles.studentName}>Xin chào, {displayName} 👋</TamaText>
      <TamaText style={styles.studentDate}>{studentProfile.greetingDate}</TamaText>
    </YStack>
    <Pressable accessibilityRole={onMessage ? 'button' : undefined} accessibilityLabel={onMessage ? 'Tin nhắn' : undefined} disabled={!onMessage} onPress={onMessage} style={styles.message}>
      <Feather name="message-circle" size={24} color={colors.text} /><View style={styles.dot} />
    </Pressable>
  </XStack>;
}

export function ResidenceHeader({ title, onBack, showBack = true }: { title: string; onBack?: () => void; showBack?: boolean }) { return <XStack style={styles.pageHeader}>{showBack ? <Pressable onPress={onBack} accessibilityLabel="Quay lại" style={styles.back}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable> : null}<TamaText style={styles.pageTitle}>{title}</TamaText></XStack>; }

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { return <XStack style={styles.sectionHeader}><TamaText style={styles.sectionTitle}>{title}</TamaText>{action && onAction ? <Pressable onPress={onAction}><TamaText style={styles.sectionAction}>{action}</TamaText></Pressable> : null}</XStack>; }

export function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <XStack style={[styles.detailRow, !last && styles.detailBorder]}><TamaText style={styles.detailLabel}>{label}</TamaText><TamaText style={styles.detailValue}>{value}</TamaText></XStack>; }

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: object }>) { return <Card size={false} style={[styles.surfaceCard, style]}>{children}</Card>; }

export function UtilityMiniCard({ kind }: { kind: 'electricity' | 'water' }) { const electricity = kind === 'electricity'; const value = electricity ? `${utilityOverview.electricityKwh} kWh` : `${utilityOverview.waterM3} m³`; const delta = electricity ? `+${utilityOverview.electricityKwh - utilityOverview.previousElectricityKwh} kWh so với tháng trước` : 'Không thay đổi'; return <SurfaceCard style={styles.utilityMini}><XStack style={styles.utilityHeading}><Feather name={electricity ? 'zap' : 'droplet'} size={17} color={electricity ? '#C67A14' : '#2674C6'} /><Text style={styles.utilityLabel}>{electricity ? 'Điện' : 'Nước'}</Text></XStack><Text style={styles.utilityValue}>{value}</Text><Text style={[styles.utilityDelta, electricity && styles.increase]}>{delta}</Text></SurfaceCard>; }

export function IconTile({ icon, label, onPress }: { icon: Icon; label: string; onPress?: () => void }) { return <Pressable style={styles.iconTile} disabled={!onPress} onPress={onPress}><View style={styles.iconBox}><Feather name={icon} size={21} color={colors.primary} /></View><Text style={styles.iconLabel}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  studentHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 22 }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.surface, fontFamily: typography.bold, fontSize: 15 }, studentCopy: { flex: 1, marginLeft: 10 }, studentName: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, studentDate: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 4 }, message: { width: 35, alignItems: 'center' }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, position: 'absolute', top: -2, right: 3 },
  pageHeader: { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border }, back: { width: 25 }, pageTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 }, sectionAction: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 },
  surfaceCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 0.8, borderColor: colors.border, padding: 14 }, detailRow: { minHeight: 33, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, detailBorder: { borderBottomWidth: 0.8, borderBottomColor: colors.border }, detailLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, detailValue: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 },
  utilityMini: { flex: 1, minHeight: 108 }, utilityHeading: { flexDirection: 'row', gap: 10, alignItems: 'center' }, utilityLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, utilityValue: { color: colors.text, fontFamily: typography.regular, fontSize: 19, marginTop: 10 }, utilityDelta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, lineHeight: 15, marginTop: 2 }, increase: { color: colors.error },
  iconTile: { flex: 1, alignItems: 'center' }, iconBox: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.actionIconBackground }, iconLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 11.5, textAlign: 'center', marginTop: 6 },
});
