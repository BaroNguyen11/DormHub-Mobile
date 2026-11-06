import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { repairCategories, repairPriorities, repairStatusLabels } from '../../mocks/repairs';
import { colors, radius, typography } from '../../theme';
import type { RepairCategory, RepairRequest } from '../../types/repair';

const icons = { ELECTRIC: 'zap', WATER: 'droplet', AIR_CONDITIONER: 'wind', FURNITURE: 'inbox', ROOM: 'home', OTHER: 'tool' } as const;

export function RepairCategoryIcon({ category, status }: { category: RepairCategory; status?: RepairRequest['status'] }) {
  const cancelled = status === 'CANCELLED';
  const background = cancelled ? colors.rejectionBackground : category === 'ELECTRIC' ? colors.limitedBackground : category === 'WATER' ? colors.waterIconBackground : category === 'AIR_CONDITIONER' ? colors.fullBackground : colors.availableBackground;
  const color = cancelled ? colors.error : category === 'ELECTRIC' ? colors.limitedText : category === 'WATER' ? colors.repairProgressText : category === 'AIR_CONDITIONER' ? colors.textSecondary : colors.availableText;
  return <View style={[styles.categoryIcon, { backgroundColor: background }]}><Feather name={icons[category]} size={20} color={color} /></View>;
}

export function RepairStatusBadge({ status }: { status: RepairRequest['status'] }) {
  const background = status === 'IN_PROGRESS' ? colors.repairProgressBackground : status === 'RECEIVED' ? colors.limitedBackground : status === 'COMPLETED' ? colors.availableBackground : colors.fullBackground;
  const color = status === 'IN_PROGRESS' ? colors.repairProgressText : status === 'RECEIVED' ? colors.limitedText : status === 'COMPLETED' ? colors.availableText : colors.textSecondary;
  return <View style={[styles.badge, { backgroundColor: background }]}><Text style={[styles.badgeText, { color }]}>{repairStatusLabels[status]}</Text></View>;
}

export function RepairRequestRow({ request, variant, onPress }: { request: RepairRequest; variant: 'current' | 'history'; onPress?: () => void }) {
  const priority = repairPriorities.find((item) => item.id === request.priority)?.label.toLowerCase();
  const subtitle = variant === 'current' ? `${request.id} · ${request.createdDate}` : request.status === 'CANCELLED' ? `${request.createdDate} · Đã hủy` : `${request.createdDate} · Ưu tiên ${priority}`;
  return <Pressable disabled={!onPress} onPress={onPress} style={styles.row}><RepairCategoryIcon category={request.category} status={request.status} /><View style={styles.rowCopy}><Text style={styles.rowTitle} numberOfLines={2}>{request.title}</Text><Text style={styles.rowSubtitle}>{subtitle}</Text></View><RepairStatusBadge status={request.status} /></Pressable>;
}

export function RepairAttachment({ uri, size = 60 }: { uri?: string; size?: number }) {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.button }} contentFit="cover" />;
  return <LinearGradient colors={[colors.roomImageGradientStart, colors.roomImageGradientEnd]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[styles.attachment, { width: size, height: size }]}><Feather name="camera" size={20} color={colors.roomImageIcon} /></LinearGradient>;
}

export function repairCategoryLabel(category: RepairCategory) { return repairCategories.find((item) => item.id === category)?.label ?? ''; }
export function repairPriorityLabel(priority: RepairRequest['priority']) { return repairPriorities.find((item) => item.id === priority)?.label ?? ''; }

const styles = StyleSheet.create({
  categoryIcon: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }, badgeText: { fontFamily: typography.bold, fontSize: 11 },
  row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12 }, rowCopy: { flex: 1 }, rowTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13, lineHeight: 17 }, rowSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 3 },
  attachment: { borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
});
