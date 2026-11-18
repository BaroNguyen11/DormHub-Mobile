import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { InvoiceStatusBadge } from '../components/ui/InvoiceUi';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import type { InvoiceDetail } from '../types/invoice';
import { formatIsoDate, formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'InvoiceDetail'>;
export function InvoiceDetailScreen({ navigation, route }: Props) {
  const { fetchInvoice } = useInvoices();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  useEffect(() => { let active = true; fetchInvoice(route.params.invoiceId).then((item) => { if (active) setInvoice(item); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được hóa đơn.'); }); return () => { active = false; }; }, [fetchInvoice, route.params.invoiceId]);
  if (!invoice) return <ScreenContainer><ResidenceHeader title="Chi tiết hóa đơn" onBack={() => navigation.goBack()} /><Text style={styles.state}>{error ?? 'Đang tải hóa đơn...'}</Text></ScreenContainer>;
  const payable = invoice.status === 'UNPAID';
  const startPayment = () => {
    if (!payable || started.current) return;
    started.current = true; setBusy(true);
    navigation.navigate('PaymentProcessing', { invoiceId: invoice.id, method: 'SEPAY' });
  };
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title={invoice.title} onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <XStack style={styles.summary}><View><Text style={styles.label}>Tổng tiền</Text><Text style={styles.amount}>{formatVnd(invoice.totalAmount)}</Text><Text style={styles.due}>Hạn thanh toán: {formatIsoDate(invoice.dueDate)}</Text></View><InvoiceStatusBadge invoice={invoice} /></XStack>
    <SurfaceCard><Text style={styles.section}>Chi tiết hóa đơn</Text>{invoice.lineItems.length ? invoice.lineItems.map((item) => <DetailRow key={item.id} label={item.label} value={formatVnd(item.amount)} />) : <Text style={styles.empty}>Backend chưa cung cấp các dòng chi tiết cho hóa đơn này.</Text>}<DetailRow label="Tổng cộng" value={formatVnd(invoice.totalAmount)} last /></SurfaceCard>
    {payable ? <Text style={styles.hint}>Thanh toán bằng mã QR chuyển khoản ngân hàng. Ứng dụng sẽ xác nhận giao dịch từ Backend.</Text> : null}
    {route.params.paymentError ? <Text style={styles.error}>{route.params.paymentError}</Text> : null}
    {payable ? <AppButton title={busy ? 'Đang mở thanh toán...' : 'Tạo mã thanh toán'} loading={busy} onPress={startPayment} /> : null}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 18 }, summary: { alignItems: 'center', justifyContent: 'space-between', gap: 8 }, label: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 }, amount: { color: colors.text, fontFamily: typography.bold, fontSize: 27, marginTop: 4 }, due: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 6 }, section: { color: colors.text, fontFamily: typography.bold, fontSize: 15, marginBottom: 8 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, paddingVertical: 12 }, hint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 }, state: { color: colors.textSecondary, fontFamily: typography.regular, padding: 16 } });
