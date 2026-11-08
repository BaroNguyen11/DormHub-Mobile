import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { getStudentInvoices } from '../api/invoices';
import type { StudentInvoiceSummary } from '../api/invoices';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatBillingMonth, formatMoney, invoiceTypeLabels } from '../utils/billing';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentHistory'>;
export function PaymentHistoryScreen({ navigation }: Props) {
  const [invoices, setInvoices] = useState<StudentInvoiceSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    setInvoices([]);
    void getStudentInvoices(0, 20, 'PAID').then((result) => {
      if (active) { setInvoices(result.content); setPage(result.page); setTotalPages(result.totalPages); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không thể tải hóa đơn.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const loadMore = async () => {
    if (more || loading || page + 1 >= totalPages) return;
    setMore(true);
    setError(undefined);
    try {
      const result = await getStudentInvoices(page + 1, 20, 'PAID');
      setInvoices((previous) => [...previous, ...result.content]);
      setPage(result.page);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải thêm hóa đơn.'); }
    finally { setMore(false); }
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hóa đơn đã thanh toán" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.message}>Đây là các hóa đơn đã thanh toán, không phải lịch sử đầy đủ của từng giao dịch.</Text>
      {loading ? <Text style={styles.message}>Đang tải hóa đơn...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && !invoices.length ? <Text style={styles.message}>Chưa có hóa đơn đã thanh toán.</Text> : null}
      {invoices.map((invoice) => <Pressable key={invoice.invoiceId} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: String(invoice.invoiceId) })}>
        <SurfaceCard><Text style={styles.title}>{invoiceTypeLabels[invoice.invoiceType]} · Kỳ {formatBillingMonth(invoice.billingMonth)}</Text>
          <DetailRow label="Mã hóa đơn" value={String(invoice.invoiceId)} />
          <DetailRow label="Số tiền" value={formatMoney(invoice.totalAmount)} last /></SurfaceCard></Pressable>)}
      {!loading && page + 1 < totalPages ? <AppButton title={more ? 'Đang tải...' : 'Xem thêm'} variant="outline" disabled={more} onPress={() => void loadMore()} /> : null}
      {!loading && error && !invoices.length ? <AppButton title="Thử lại" variant="outline" onPress={() => setReload((value) => value + 1)} /> : null}
    </ScrollView>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 28 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 14, marginBottom: 8 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 13 },
});
