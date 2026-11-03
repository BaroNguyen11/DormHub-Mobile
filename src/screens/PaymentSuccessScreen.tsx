import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, radius, typography } from '../theme';
import type { InvoiceStackParamList, StudentTabsParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentSuccess'>;
export function PaymentSuccessScreen({ navigation, route }: Props) {
  const { payments, invoices } = useInvoices();
  const payment = payments.find((item) => item.id === route.params.paymentId && item.status === 'SUCCESS');
  const invoice = payment ? invoices.find((item) => item.id === payment.invoiceId) : undefined;
  if (!payment || !invoice) return <ScreenContainer><Text style={styles.missing}>Không tìm thấy giao dịch.</Text></ScreenContainer>;
  const viewInvoice = () => navigation.reset({ index: 1, routes: [{ name: 'InvoiceList' }, { name: 'InvoiceDetail', params: { invoiceId: invoice.id } }] });
  const goHome = () => { const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>(); navigation.reset({ index: 0, routes: [{ name: 'InvoiceList' }] }); tabs?.navigate('Home', { screen: 'HomeDashboard' }); };
  return <ScreenContainer><StatusBar style="dark" /><View style={styles.outer}><View style={styles.group}><View style={styles.checkCircle}><Feather name="check" size={39} color={colors.availableText} /></View><Text style={styles.title}>Thanh toán thành công</Text><Text style={styles.amount}>{formatVnd(payment.amount)}</Text><SurfaceCard style={styles.card}><DetailRow label="Mã giao dịch" value={payment.id} /><DetailRow label="Thời gian" value={`${payment.date} · ${payment.time ?? ''}`} /><DetailRow label="Hóa đơn" value={`Tháng ${invoice.period.slice(-2).replace(/^0/, '')} · ${invoice.roomId}`} last /></SurfaceCard><View style={styles.actions}><AppButton title="Xem hóa đơn" onPress={viewInvoice} /><Pressable style={styles.homeButton} onPress={goHome}><Text style={styles.homeText}>Về trang chủ</Text></Pressable></View></View></View></ScreenContainer>;
}
const styles = StyleSheet.create({ outer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, group: { width: '100%', alignItems: 'center', marginTop: -36 }, checkCircle: { width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.availableBackground, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontFamily: typography.regular, fontSize: 20, marginTop: 14 }, amount: { color: colors.text, fontFamily: typography.regular, fontSize: 24, marginTop: 10 }, card: { width: '100%', maxWidth: 319, marginTop: 22, padding: 14 }, actions: { width: '100%', maxWidth: 319, marginTop: 20 }, homeButton: { height: 44, alignItems: 'center', justifyContent: 'center' }, homeText: { color: colors.primary, fontFamily: typography.bold, fontSize: 14 }, missing: { padding: 16, color: colors.text } });
