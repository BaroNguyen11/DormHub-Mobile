import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { IconTile, SectionHeader, StudentHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { useInvoices } from '../context/InvoiceContext';
import { useNotifications } from '../context/NotificationContext';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList, StudentTabsParamList } from '../types/navigation';
import { ResidenceLandingScreen } from './ResidenceLandingScreen';
import { formatIsoDate, formatVnd } from '../utils/invoice';
import { notificationTimeLabel } from '../utils/notification';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeDashboard'>;
export function HomeScreen({ navigation }: Props) {
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const { session } = useResidence();
  const { invoices } = useInvoices();
  const { notifications } = useNotifications();
  const room = session.room;
  const invoice = invoices.find((item) => item.status === 'UNPAID');
  const recentNotifications = notifications.slice(0, 3);
  if (session.status !== 'active') return <ResidenceLandingScreen />;
  return <ScreenContainer><StatusBar style="dark" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <StudentHeader />
    <Pressable style={styles.roomCard} onPress={() => tabs?.navigate('Room', { screen: 'MyRoom' })}><XStack style={styles.roomTop}><Text style={styles.roomLabel}>Phòng hiện tại</Text><Text style={styles.activeBadge}>Đang ở</Text></XStack><Text style={styles.roomName}>{room ? `Phòng ${room.roomNumber}` : `Phòng ${session.roomId}`}</Text><Text style={styles.roomMeta}>{room ? `${room.buildingName} · Tầng ${room.floor} · ${room.currentOccupancy}/${room.capacity} người` : 'Thông tin phòng chưa tải được'}</Text></Pressable>
    {invoice ? <SurfaceCard style={styles.invoiceCard}><View style={styles.invoiceTop}><Text style={styles.invoiceMonth}>{invoice.title}</Text><Text style={styles.unpaid}>Chưa thanh toán</Text></View><Text style={styles.invoicePrice}>{formatVnd(invoice.totalAmount)}</Text><View style={styles.due}><Feather name="calendar" size={16} color={colors.textSecondary} /><Text style={styles.dueText}>Hạn thanh toán: {formatIsoDate(invoice.dueDate)}</Text></View><AppButton title="Xem hóa đơn" onPress={() => tabs?.navigate('Invoice', { screen: 'InvoiceDetail', params: { invoiceId: invoice.id } })} /></SurfaceCard> : null}
    <SectionHeader title="Chức năng" /><XStack style={styles.quick}><IconTile icon="tool" label="Sửa chữa" onPress={() => navigation.navigate('RepairRequestList')} /><IconTile icon="file-text" label="Hóa đơn" onPress={() => tabs?.navigate('Invoice', { screen: 'InvoiceList' })} /><IconTile icon="file" label="Hợp đồng" onPress={() => tabs?.navigate('Room', { screen: 'Contract' })} /><IconTile icon="bell" label="Thông báo" onPress={() => tabs?.navigate('Notifications', { screen: 'NotificationCenter' })} /></XStack>
    <SectionHeader title="Thông báo mới" action="Xem tất cả" onAction={() => tabs?.navigate('Notifications', { screen: 'NotificationCenter' })} />
    {recentNotifications.length ? <SurfaceCard>{recentNotifications.map((item, index) => <View key={item.id} style={[styles.notification, index > 0 && styles.notificationBorder]}><View style={styles.notificationIcon}><Feather name="bell" size={19} color={colors.textSecondary} /></View><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.notificationMessage} numberOfLines={2}>{item.summary}</Text></View><Text style={styles.notificationTime}>{notificationTimeLabel(item.createdAt, new Date().toISOString())}</Text></View>)}</SurfaceCard> : <Text style={styles.empty}>Chưa có thông báo mới.</Text>}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: 12, paddingBottom: 16, gap: 16 }, roomCard: { backgroundColor: colors.primary, borderRadius: radius.card, padding: 18 }, roomTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, roomLabel: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12 }, activeBadge: { color: colors.surface, backgroundColor: '#4B5D91', overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11.5 }, roomName: { color: colors.surface, fontFamily: typography.regular, fontSize: 21, marginTop: 3 }, roomMeta: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12.5, marginTop: 6 }, invoiceCard: { padding: 18 }, invoiceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, invoiceMonth: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, unpaid: { color: colors.limitedText, backgroundColor: colors.limitedBackground, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, fontFamily: typography.bold, fontSize: 11 }, invoicePrice: { color: colors.text, fontFamily: typography.regular, fontSize: 22 }, due: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 14 }, dueText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, quick: { flexDirection: 'row' }, notification: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }, notificationBorder: { borderTopWidth: 0.8, borderTopColor: colors.border }, notificationIcon: { width: 38, height: 38, borderRadius: radius.button, backgroundColor: colors.fullBackground, justifyContent: 'center', alignItems: 'center' }, notificationCopy: { flex: 1 }, notificationTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, notificationMessage: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 2 }, notificationTime: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 } });
