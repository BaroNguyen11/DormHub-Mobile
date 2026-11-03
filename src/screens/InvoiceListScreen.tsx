import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterChip } from '../components/ui/FilterChip';
import { InvoiceCard } from '../components/ui/InvoiceUi';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { mockTodayIso } from '../mocks/invoices';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { daysOverdue } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'InvoiceList'>;
type Filter = 'all' | 'unpaid' | 'paid' | 'overdue';
const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tất cả' }, { id: 'unpaid', label: 'Chưa thanh toán' }, { id: 'paid', label: 'Đã thanh toán' }, { id: 'overdue', label: 'Quá hạn' }];
export function InvoiceListScreen({ navigation }: Props) {
  const { invoices } = useInvoices();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = useMemo(() => invoices.filter((invoice) => filter === 'all' || (filter === 'unpaid' && invoice.status === 'UNPAID' && daysOverdue(invoice, mockTodayIso) === 0) || (filter === 'paid' && invoice.status === 'PAID') || (filter === 'overdue' && daysOverdue(invoice, mockTodayIso) > 0)), [invoices, filter]);
  return <ScreenContainer><StatusBar style="dark" /><View style={styles.heading}><ResidenceHeader title="Hóa đơn" showBack={false} /><Pressable style={styles.historyButton} onPress={() => navigation.navigate('PaymentHistory')} accessibilityLabel="Lịch sử thanh toán"><Feather name="clock" size={19} color={colors.primary} /></Pressable></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{filters.map((item) => <FilterChip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />)}</ScrollView><Text style={styles.section}>{filter === 'all' ? 'Xem tất cả' : filters.find((item) => item.id === filter)?.label}</Text>{visible.length ? visible.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id })} />) : <Text style={styles.empty}>Không có hóa đơn trong mục này.</Text>}</ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ heading: { position: 'relative' }, historyButton: { position: 'absolute', right: 16, top: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }, content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 14 }, chips: { flexDirection: 'row', gap: 8, paddingRight: 16 }, section: { color: colors.primary, fontFamily: typography.bold, fontSize: 15, marginTop: 14 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 } });
