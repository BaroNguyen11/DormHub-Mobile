import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { YStack } from 'tamagui';

import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, radius, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentHistory'>;
export function PaymentHistoryScreen({ navigation }: Props) {
  const { payments, refreshInvoices, loading, error } = useInvoices();
  useFocusEffect(useCallback(() => { void refreshInvoices().catch(() => undefined); }, [refreshInvoices]));
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử thanh toán" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{loading ? <ActivityIndicator color={colors.primary} /> : error ? <YStack style={styles.errorBox}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void refreshInvoices().catch(() => undefined)}><Text style={styles.retry}>Thử lại</Text></Pressable></YStack> : payments.length ? <SurfaceCard style={styles.card}>{payments.map((payment, index) => { const success = payment.status === 'SUCCESS'; const pending = payment.status === 'PENDING'; return <Pressable key={payment.id} onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: payment.invoiceId })} style={[styles.row, index > 0 && styles.border]}><View style={[styles.icon, success ? styles.successIcon : pending ? styles.pendingIcon : styles.failedIcon]}><Feather name={success ? 'check' : pending ? 'clock' : 'x'} size={20} color={success ? colors.availableText : pending ? colors.warningText : colors.error} /></View><YStack style={styles.copy}><Text style={styles.title}>{payment.invoiceTitle}</Text><Text style={styles.subtitle}>{success ? 'Đã thanh toán' : pending ? 'Đang chờ thanh toán' : 'Giao dịch thất bại'} · {payment.id} · {payment.date}</Text></YStack><Text style={[styles.amount, !success && styles.failedAmount]}>{formatVnd(payment.amount)}</Text></Pressable>; })}</SurfaceCard> : <Text style={styles.empty}>Chưa có lịch sử thanh toán.</Text>}</ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, card: { padding: 14 }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 }, border: { borderTopWidth: 0.8, borderTopColor: colors.border }, icon: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' }, successIcon: { backgroundColor: colors.availableBackground }, failedIcon: { backgroundColor: colors.rejectionBackground }, pendingIcon: { backgroundColor: colors.limitedBackground }, copy: { flex: 1 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, lineHeight: 15, marginTop: 2 }, amount: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, failedAmount: { color: colors.inactiveTab }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, textAlign: 'center', padding: 24 }, errorBox: { padding: 14, gap: 8, backgroundColor: colors.rejectionBackground, borderRadius: 10 }, error: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 } });
