import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '../../theme';
import type { AppNotification, NotificationType } from '../../types/notification';
import { notificationTimeLabel } from '../../utils/notification';

type IconName = ComponentProps<typeof Feather>['name'];
const iconNames: Record<NotificationType, IconName> = {
  INVOICE: 'file-text', REPAIR: 'tool', CONTRACT: 'file-text', PAYMENT: 'credit-card', SYSTEM: 'info',
};

export function NotificationIcon({ type, prominent = false }: { type: NotificationType; prominent?: boolean }) {
  return <View style={[styles.iconBox, prominent && styles.prominentIcon]}>
    <Feather name={iconNames[type]} size={20} color={prominent ? colors.primary : colors.textSecondary} />
  </View>;
}

export function NotificationRow({ item, nowIso, onPress }: { item: AppNotification; nowIso: string; onPress: () => void }) {
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${item.title}, ${item.isRead ? 'đã đọc' : 'chưa đọc'}`}
    onPress={onPress}
    style={[styles.card, !item.isRead && styles.unreadCard]}
  >
    <NotificationIcon type={item.type} prominent={!item.isRead} />
    <View style={styles.copy}>
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
    </View>
    <View style={styles.trailing}>
      <Text style={styles.time}>{notificationTimeLabel(item.createdAt, nowIso)}</Text>
      {!item.isRead ? <View style={styles.unreadDot} /> : null}
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { minHeight: 62, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: radius.card, backgroundColor: colors.notificationReadCard },
  unreadCard: { backgroundColor: colors.notificationUnreadCard },
  iconBox: { width: 38, height: 38, borderRadius: radius.button, backgroundColor: colors.fullBackground, alignItems: 'center', justifyContent: 'center' },
  prominentIcon: { backgroundColor: colors.surface },
  copy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: typography.cardTitle },
  summary: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: typography.body, lineHeight: 18, marginTop: 2 },
  trailing: { alignItems: 'center', justifyContent: 'center', minWidth: 28, gap: 5 },
  time: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: typography.body },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
});
