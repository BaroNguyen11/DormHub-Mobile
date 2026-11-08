import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getStudentInvoice } from '../api/invoices';
import type { StudentInvoiceDetail } from '../api/invoices';
import { createInvoicePayment } from '../api/payments';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatBillingMonth, formatLocalDate, formatMoney, invoiceStatusLabels, invoiceTypeLabels } from '../utils/billing';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'InvoiceDetail'>;
export function InvoiceDetailScreen({ navigation, route }: Props) {
  const parsed = /^\d+$/.test(route.params.invoiceId) ? Number(route.params.invoiceId) : 0;
  const invoiceId = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  const [invoice, setInvoice] = useState<StudentInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const creatingRef = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    setInvoice(null);
    if (invoiceId == null) { setError('Không tìm thấy hóa đơn.'); setLoading(false); return () => { active = false; }; }
    void getStudentInvoice(invoiceId).then((result) => { if (active) setInvoice(result); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải hóa đơn.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [invoiceId, reload]));

  const pay = async () => {
    if (creatingRef.current || invoiceId == null || invoice?.status !== 'UNPAID') return;
    creatingRef.current = true;
    setCreating(true);
    setError(undefined);
    try {
      const latest = await getStudentInvoice(invoiceId);
      setInvoice(latest);
      if (latest.status !== 'UNPAID') {
        setError('Trạng thái hóa đơn đã thay đổi. Vui lòng kiểm tra lại.');
        return;
      }
      const transaction = await createInvoicePayment(invoiceId);
      if (transaction.invoiceId !== invoiceId || !Number.isSafeInteger(transaction.paymentId) || transaction.paymentId <= 0) {
        throw new Error('Chưa thể xác nhận giao dịch. Vui lòng kiểm tra lại sau.');
      }
      navigation.navigate('PaymentProcessing', { invoiceId: String(invoiceId), paymentId: String(transaction.paymentId) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo giao dịch. Vui lòng thử lại.');
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Chi tiết hóa đơn" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {loading ? <Text style={styles.message}>Đang tải hóa đơn...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !invoice ? <AppButton title="Thử lại" variant="outline" onPress={() => setReload((value) => value + 1)} /> : null}
      {invoice ? <>
        <SurfaceCard><Text style={styles.title}>{invoiceTypeLabels[invoice.invoiceType]}</Text>
          <DetailRow label="Mã hóa đơn" value={String(invoice.invoiceId)} />
          <DetailRow label="Kỳ thu" value={formatBillingMonth(invoice.billingMonth)} />
          <DetailRow label="Ngày phát hành" value={formatLocalDate(invoice.issueDate)} />
          <DetailRow label="Hạn thanh toán" value={formatLocalDate(invoice.dueDate)} />
          <DetailRow label="Trạng thái" value={invoice.overdue && invoice.status === 'UNPAID' ? 'Quá hạn thanh toán' : invoiceStatusLabels[invoice.status]} last /></SurfaceCard>
        <Text style={styles.heading}>Các khoản thu</Text>
        {invoice.details.length ? invoice.details.map((item) => <SurfaceCard key={item.detailId}>
          <Text style={styles.itemTitle}>{item.description}</Text>
          <DetailRow label="Số lượng" value={String(item.quantity)} />
          <DetailRow label="Đơn giá" value={formatMoney(item.unitPrice)} />
          <DetailRow label="Thành tiền" value={formatMoney(item.amount)} last /></SurfaceCard>) : <Text style={styles.message}>Chưa có chi tiết khoản thu.</Text>}
        <SurfaceCard><DetailRow label="Tổng tiền" value={formatMoney(invoice.totalAmount)} last /></SurfaceCard>
        {invoice.status === 'UNPAID' && invoice.totalAmount > 0 && Number.isInteger(invoice.totalAmount) ?
          <AppButton title={creating ? 'Đang tạo giao dịch...' : 'Thanh toán'} disabled={creating} onPress={() => void pay()} /> :
          invoice.status === 'UNPAID' ? <Text style={styles.message}>Hóa đơn này hiện chưa thể thanh toán.</Text> : null}
      </> : null}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 28 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 17, marginBottom: 9 },
  heading: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, itemTitle: { color: colors.text, fontFamily: typography.semibold, fontSize: 13, marginBottom: 8 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 13 },
});
