import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { getPayment } from '../api/student';
import type { PaymentDto } from '../api/student';
import { useEffect, useState } from 'react';
import { colors, radius, typography } from '../theme';
import type { InvoiceStackParamList, StudentTabsParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentSuccess'>;
export function PaymentSuccessScreen({ navigation, route }: Props) {
  const { fetchInvoice } = useInvoices();
  const [remotePayment, setRemotePayment] = useState<PaymentDto | null>(null);
  const [loadError, setLoadError] = useState<string>();
  useEffect(() => { let active = true; getPayment(route.params.paymentId).then((result) => { if (active && result.data.paymentStatus === 'SUCCESS') setRemotePayment(result.data); else if (active) setLoadError('Backend chưa xác nhận giao dịch thành công.'); }).catch((cause: unknown) => { if (active) setLoadError(cause instanceof Error ? cause.message : 'Không tải được giao dịch.'); }); return () => { active = false; }; }, [route.params.paymentId]);
  const payment = remotePayment ? { id: String(remotePayment.paymentId), invoiceId: String(remotePayment.invoiceId), amount: Number(remotePayment.expectedAmount), date: remotePayment.paidAt ?? remotePayment.createdAt } : undefined;
  const [remoteInvoice, setRemoteInvoice] = useState<Awaited<ReturnType<typeof fetchInvoice>> | null>(null);
  useEffect(() => { if (!payment?.invoiceId) return; let active = true; fetchInvoice(payment.invoiceId).then((invoiceResult) => { if (active) setRemoteInvoice(invoiceResult); }).catch((cause: unknown) => { if (active) setLoadError(cause instanceof Error ? cause.message : 'Không tải được hóa đơn.'); }); return () => { active = false; }; }, [fetchInvoice, payment?.invoiceId]);
  const invoice = remoteInvoice ?? undefined;
  if (loadError && (!payment || !invoice)) return <ScreenContainer><Text style={styles.missing}>{loadError}</Text></ScreenContainer>;
  if (!payment || !invoice) return <ScreenContainer><Text style={styles.missing}>Đang tải xác nhận giao dịch...</Text></ScreenContainer>;
  const viewInvoice = () => navigation.reset({ index: 1, routes: [{ name: 'InvoiceList' }, { name: 'InvoiceDetail', params: { invoiceId: invoice.id } }] });
  const goHome = () => { const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>(); navigation.reset({ index: 0, routes: [{ name: 'InvoiceList' }] }); tabs?.navigate('Home', { screen: 'HomeDashboard' }); };
  return <ScreenContainer><StatusBar style="dark" /><YStack style={styles.outer}><YStack style={styles.group}><YStack style={styles.checkCircle}><Feather name="check" size={39} color={colors.availableText} /></YStack><Text style={styles.title}>Thanh toán thành công</Text><Text style={styles.amount}>{formatVnd(payment.amount)}</Text><SurfaceCard style={styles.card}><DetailRow label="Mã giao dịch" value={payment.id} /><DetailRow label="Thời gian" value={new Date(payment.date).toLocaleString('vi-VN')} /><DetailRow label="Hóa đơn" value={invoice.title} last /></SurfaceCard><YStack style={styles.actions}><AppButton title="Xem hóa đơn" onPress={viewInvoice} /><Pressable style={styles.homeButton} onPress={goHome}><Text style={styles.homeText}>Về trang chủ</Text></Pressable></YStack></YStack></YStack></ScreenContainer>;
}
const styles = StyleSheet.create({ outer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, group: { width: '100%', alignItems: 'center', marginTop: -36 }, checkCircle: { width: 76, height: 76, borderRadius: radius.pill, backgroundColor: colors.availableBackground, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontFamily: typography.regular, fontSize: 20, marginTop: 14 }, amount: { color: colors.text, fontFamily: typography.regular, fontSize: 24, marginTop: 10 }, card: { width: '100%', maxWidth: 319, marginTop: 22, padding: 14 }, actions: { width: '100%', maxWidth: 319, marginTop: 20 }, homeButton: { height: 44, alignItems: 'center', justifyContent: 'center' }, homeText: { color: colors.primary, fontFamily: typography.bold, fontSize: 14 }, missing: { padding: 16, color: colors.text } });
