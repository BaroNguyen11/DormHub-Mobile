import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, radius, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentHistory'>;
export function PaymentHistoryScreen({ navigation }: Props) {
  const { payments, invoices } = useInvoices();
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử thanh toán" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><SurfaceCard style={styles.card}>{payments.map((payment, index) => { const success = payment.status === 'SUCCESS'; const exists = invoices.some((item) => item.id === payment.invoiceId); return <Pressable key={payment.id} disabled={!exists || !success} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: payment.invoiceId })} style={[styles.row, index > 0 && styles.border]}><View style={[styles.icon, success ? styles.successIcon : styles.failedIcon]}><Feather name={success ? 'check' : 'x'} size={20} color={success ? colors.availableText : colors.error} /></View><View style={styles.copy}><Text style={styles.title}>{payment.invoiceTitle}</Text><Text style={styles.subtitle}>{payment.method === 'VNPAY' ? 'VNPay' : 'SePay'} · {success ? `${payment.id} · ` : 'Giao dịch thất bại · '}{payment.date}</Text></View><Text style={[styles.amount, !success && styles.failedAmount]}>{formatVnd(payment.amount)}</Text></Pressable>; })}</SurfaceCard></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, card: { padding: 14 }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 }, border: { borderTopWidth: 0.8, borderTopColor: colors.border }, icon: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' }, successIcon: { backgroundColor: colors.availableBackground }, failedIcon: { backgroundColor: colors.rejectionBackground }, copy: { flex: 1 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, lineHeight: 15, marginTop: 2 }, amount: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, failedAmount: { color: colors.inactiveTab } });
