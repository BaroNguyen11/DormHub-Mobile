import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { NotificationIcon } from '../components/ui/NotificationUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { useNotifications } from '../context/NotificationContext';
import { colors, radius, typography } from '../theme';
import type { NotificationStackParamList, StudentTabsParamList } from '../types/navigation';
import { notificationDateTime } from '../utils/notification';

type Props = NativeStackScreenProps<NotificationStackParamList, 'NotificationDetail'>;

function bodyParts(body: string, emphasis: readonly string[]) {
  if (!emphasis.length) return [body];
  const parts: string[] = [];
  let remaining = body;
  while (remaining) {
    const next = emphasis.map((value) => ({ value, index: remaining.indexOf(value) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index)[0];
    if (!next) { parts.push(remaining); break; }
    if (next.index > 0) parts.push(remaining.slice(0, next.index));
    parts.push(next.value);
    remaining = remaining.slice(next.index + next.value.length);
  }
  return parts;
}

export function NotificationDetailScreen({ navigation, route }: Props) {
  const { notifications, markRead } = useNotifications();
  const { invoices } = useInvoices();
  const notification = notifications.find((item) => item.id === route.params.notificationId);

  useEffect(() => { if (notification) markRead(notification.id); }, [markRead, notification?.id]);

  const invoiceId = notification?.type === 'INVOICE' ? notification.targetId : undefined;
  const canOpenInvoice = !!invoiceId && invoices.some((item) => item.id === invoiceId);
  const openInvoice = () => {
    if (!canOpenInvoice || !invoiceId) return;
    navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>()?.navigate('Invoice', { screen: 'InvoiceDetail', params: { invoiceId } });
  };

  return <ScreenContainer>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>Chi tiết thông báo</Text>
    </View>
    {notification ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}>
        <NotificationIcon type={notification.type} prominent />
        <View style={styles.headingCopy}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.date}>{notificationDateTime(notification.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.bodyCard}>
        <Text style={styles.body}>
          {bodyParts(notification.body, notification.emphasis ?? []).map((part, index) =>
            notification.emphasis?.includes(part) ? <Text key={index} style={styles.emphasis}>{part}</Text> : part,
          )}
        </Text>
      </View>
      {canOpenInvoice ? <View style={styles.action}><AppButton title="Xem hóa đơn" onPress={openInvoice} /></View> : null}
    </ScrollView> : <Text style={styles.missing}>Không tìm thấy thông báo.</Text>}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  headingCopy: { flex: 1 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  date: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, marginTop: 2 },
  bodyCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16 },
  body: { color: colors.text, fontFamily: typography.regular, fontSize: 14, lineHeight: 23 },
  emphasis: { fontFamily: typography.bold },
  action: { marginTop: 20 },
  missing: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14, padding: 16 },
});
