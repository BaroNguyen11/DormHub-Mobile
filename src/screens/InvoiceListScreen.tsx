import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getStudentInvoices } from '../api/invoices';
import type { StudentInvoiceSummary } from '../api/invoices';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatBillingMonth, formatLocalDate, formatMoney, invoiceStatusLabels, invoiceTypeLabels } from '../utils/billing';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'InvoiceList'>;
type Filter = 'ALL' | 'UNPAID' | 'PAID';

export function InvoiceListScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [items, setItems] = useState<StudentInvoiceSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  useFocusEffect(useCallback(() => {
    const current = ++requestId.current;
    setLoading(true);
    setError(undefined);
    setItems([]);
    void getStudentInvoices(0, 20, filter === 'ALL' ? undefined : filter).then((result) => {
      if (current !== requestId.current) return;
      setItems(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
    }).catch((cause) => {
      if (current === requestId.current) setError(cause instanceof Error ? cause.message : 'Không thể tải hóa đơn.');
    }).finally(() => { if (current === requestId.current) setLoading(false); });
    return () => { requestId.current++; };
  }, [filter, reload]));

  const loadMore = async () => {
    if (loadingMoreRef.current || loading || page + 1 >= totalPages) return;
    const current = requestId.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(undefined);
    try {
      const result = await getStudentInvoices(page + 1, 20, filter === 'ALL' ? undefined : filter);
      if (current === requestId.current) {
        setItems((previous) => [...previous, ...result.content]);
        setPage(result.page);
        setTotalPages(result.totalPages);
      }
    } catch (cause) {
      if (current === requestId.current) setError(cause instanceof Error ? cause.message : 'Không thể tải thêm hóa đơn.');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hóa đơn" showBack={false} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.filters}>{(['ALL', 'UNPAID', 'PAID'] as const).map((option) =>
        <Pressable key={option} accessibilityRole="button" onPress={() => setFilter(option)} style={[styles.filter, filter === option && styles.selected]}>
          <Text style={[styles.filterText, filter === option && styles.selectedText]}>{option === 'ALL' ? 'Tất cả' : invoiceStatusLabels[option]}</Text>
        </Pressable>)}</View>
      {loading ? <Text style={styles.message}>Đang tải hóa đơn...</Text> : null}
      {!loading && error && !items.length ? <View style={styles.state}><Text style={styles.error}>{error}</Text><AppButton title="Thử lại" variant="outline" onPress={() => setReload((value) => value + 1)} /></View> : null}
      {!loading && !error && !items.length ? <Text style={styles.message}>Chưa có hóa đơn trong mục này.</Text> : null}
      {!loading && items.map((invoice) => <Pressable key={invoice.invoiceId} accessibilityRole="button" onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: String(invoice.invoiceId) })}>
        <SurfaceCard style={styles.card}><Text style={styles.title}>{invoiceTypeLabels[invoice.invoiceType]} · Kỳ {formatBillingMonth(invoice.billingMonth)}</Text>
          <Text style={styles.amount}>{formatMoney(invoice.totalAmount)}</Text>
          <DetailRow label="Trạng thái" value={invoice.overdue && invoice.status === 'UNPAID' ? 'Quá hạn thanh toán' : invoiceStatusLabels[invoice.status]} />
          <DetailRow label="Hạn thanh toán" value={formatLocalDate(invoice.dueDate)} last /></SurfaceCard>
      </Pressable>)}
      {!loading && error && items.length ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && page + 1 < totalPages ? <AppButton title={loadingMore ? 'Đang tải...' : 'Xem thêm'} variant="outline" disabled={loadingMore} onPress={() => void loadMore()} /> : null}
      <AppButton title="Hóa đơn đã thanh toán" variant="text" onPress={() => navigation.navigate('PaymentHistory')} />
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 28 }, filters: { flexDirection: 'row', gap: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontFamily: typography.semibold, fontSize: 12 }, selectedText: { color: colors.surface },
  card: { gap: 8 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  amount: { color: colors.primary, fontFamily: typography.bold, fontSize: 19 },
  state: { gap: 12 }, message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 13 },
});
