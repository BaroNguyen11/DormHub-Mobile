import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { IconTile, SectionHeader, StudentHeader, SurfaceCard, UtilityMiniCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { useInvoices } from '../context/InvoiceContext';
import { featuredInvoiceId } from '../mocks/invoices';
import { homeOverview, residentRoom } from '../mocks/residence';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList, RootStackParamList, StudentTabsParamList } from '../types/navigation';
import { ResidenceLandingScreen } from './ResidenceLandingScreen';
import { formatIsoDate, formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeDashboard'>;
export function HomeScreen({ navigation }: Props) {
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const { session } = useResidence();
  const { invoices } = useInvoices();
  const featuredInvoice = invoices.find((item) => item.id === featuredInvoiceId);
  if (session.status !== 'active') return <ResidenceLandingScreen />;
  return <ScreenContainer><StatusBar style="dark" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <StudentHeader onMessage={() => tabs?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Chat')} />
    <Pressable style={styles.roomCard} onPress={() => tabs?.navigate('Room', { screen: 'MyRoom' })}><View style={styles.roomTop}><Text style={styles.roomLabel}>Phòng hiện tại</Text><Text style={styles.activeBadge}>Hiệu lực</Text></View><Text style={styles.roomName}>{residentRoom.name}</Text><Text style={styles.roomMeta}>{residentRoom.building} · Tầng {residentRoom.floor} · {residentRoom.occupied}/{residentRoom.capacity} người</Text></Pressable>
    {featuredInvoice ? <SurfaceCard style={styles.invoiceCard}><View style={styles.invoiceTop}><Text style={styles.invoiceMonth}>{featuredInvoice.title}</Text><Text style={[styles.unpaid, featuredInvoice.status === 'PAID' && styles.paid]}>{featuredInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text></View><Text style={styles.invoicePrice}>{formatVnd(featuredInvoice.totalAmount)}</Text><View style={styles.due}><Feather name="calendar" size={16} color={colors.textSecondary} /><Text style={styles.dueText}>Hạn thanh toán: {formatIsoDate(featuredInvoice.dueDate)}</Text></View><AppButton title={featuredInvoice.status === 'PAID' ? 'Xem hóa đơn' : 'Thanh toán'} onPress={() => tabs?.navigate('Invoice', { screen: 'InvoiceDetail', params: { invoiceId: featuredInvoice.id } })} /></SurfaceCard> : null}
    <SectionHeader title="Hành động nhanh" /><View style={styles.quick}><IconTile icon="tool" label="Báo sửa chữa" onPress={() => navigation.navigate('RepairRequestList')} /><IconTile icon="file-text" label="Hóa đơn" onPress={() => tabs?.navigate('Invoice', { screen: 'InvoiceList' })} /><IconTile icon="zap" label="Điện nước" onPress={() => tabs?.navigate('Room', { screen: 'Utilities' })} /><IconTile icon="file" label="Hợp đồng" onPress={() => tabs?.navigate('Room', { screen: 'Contract' })} /></View>
    <SectionHeader title="Điện & nước tháng này" action="Chi tiết" onAction={() => tabs?.navigate('Room', { screen: 'Utilities' })} /><View style={styles.utilities}><UtilityMiniCard kind="electricity" /><UtilityMiniCard kind="water" /></View>
    <SectionHeader title="Thông báo gần đây" action="Xem tất cả" onAction={() => undefined} /><SurfaceCard>{homeOverview.notifications.map((item, index) => <View key={item.title} style={[styles.notification, index > 0 && styles.notificationBorder]}><View style={styles.notificationIcon}><Feather name={item.icon} size={19} color={colors.textSecondary} /></View><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.notificationMessage}>{item.message}</Text></View><Text style={styles.notificationTime}>{item.time}</Text></View>)}</SurfaceCard>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, paddingBottom: 16, gap: 16 }, roomCard: { backgroundColor: colors.primary, borderRadius: radius.card, padding: 18 }, roomTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, roomLabel: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12 }, activeBadge: { color: colors.surface, backgroundColor: '#4B5D91', overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11.5 }, roomName: { color: colors.surface, fontFamily: typography.regular, fontSize: 21, marginTop: 3 }, roomMeta: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12.5, marginTop: 6 },
  invoiceCard: { padding: 18 }, invoiceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, invoiceMonth: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, unpaid: { color: colors.limitedText, backgroundColor: colors.limitedBackground, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, fontFamily: typography.bold, fontSize: 11 }, paid: { color: colors.availableText, backgroundColor: colors.availableBackground }, invoicePrice: { color: colors.text, fontFamily: typography.regular, fontSize: 22 }, due: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 14 }, dueText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, quick: { flexDirection: 'row', marginTop: -4, marginBottom: 2 }, utilities: { flexDirection: 'row', gap: 12 },
  notification: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }, notificationBorder: { borderTopWidth: 0.8, borderTopColor: colors.border }, notificationIcon: { width: 38, height: 38, borderRadius: radius.button, backgroundColor: colors.fullBackground, justifyContent: 'center', alignItems: 'center' }, notificationCopy: { flex: 1 }, notificationTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, notificationMessage: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 2 }, notificationTime: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11 },
});
