import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { InvoiceStatusBadge } from '../components/ui/InvoiceUi';
import { ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, radius, typography } from '../theme';
import type { PaymentMethod } from '../types/invoice';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'InvoiceDetail'>;
const methods: { id: PaymentMethod; title: string; subtitle: string }[] = [{ id: 'VNPAY', title: 'VNPay', subtitle: 'Thẻ ATM / QR / Ví điện tử' }, { id: 'SEPAY', title: 'SePay', subtitle: 'Chuyển khoản QR ngân hàng' }];
export function InvoiceDetailScreen({ navigation, route }: Props) {
  const { invoices } = useInvoices();
  const invoice = invoices.find((item) => item.id === route.params.invoiceId);
  const [method, setMethod] = useState<PaymentMethod>('VNPAY');
  const [submitting, setSubmitting] = useState(false);
  const paymentStarted = useRef(false);
  useFocusEffect(useCallback(() => {
    paymentStarted.current = false;
    setSubmitting(false);
  }, []));
  const startPayment = () => {
    if (!invoice || invoice.status !== 'UNPAID' || paymentStarted.current) return;
    paymentStarted.current = true;
    setSubmitting(true);
    navigation.navigate('PaymentProcessing', { invoiceId: invoice.id, method });
  };
  if (!invoice) return <ScreenContainer><Text style={styles.missing}>Không tìm thấy hóa đơn.</Text></ScreenContainer>;
  const payable = invoice.status === 'UNPAID';
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title={invoice.title} onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><XStack style={styles.total}><YStack><Text style={styles.totalLabel}>Tổng tiền cần thanh toán</Text><Text style={styles.totalAmount}>{formatVnd(invoice.totalAmount)}</Text></YStack><InvoiceStatusBadge invoice={invoice} /></XStack><SurfaceCard style={styles.detailCard}><Text style={styles.detailTitle}>Chi tiết</Text>{invoice.lineItems.map((item) => <XStack key={item.id} style={styles.lineItem}><Text style={styles.lineLabel}>{item.label}</Text><Text style={styles.lineAmount}>{formatVnd(item.amount)}</Text></XStack>)}<XStack style={styles.sumRow}><Text style={styles.sumLabel}>Tổng cộng</Text><Text style={styles.sumAmount}>{formatVnd(invoice.totalAmount)}</Text></XStack></SurfaceCard>{payable ? <><SectionHeader title="Chọn phương thức thanh toán" /><YStack style={styles.methods}>{methods.map((item) => <Pressable key={item.id} onPress={() => setMethod(item.id)} style={[styles.method, method === item.id && styles.methodSelected]}><View style={[styles.methodLogo, item.id === 'SEPAY' && styles.sepayLogo]}><Text style={[styles.logoText, item.id === 'SEPAY' && styles.sepayText]}>{item.title}</Text></View><YStack style={styles.methodCopy}><Text style={styles.methodTitle}>{item.title}</Text><Text style={styles.methodSubtitle}>{item.subtitle}</Text></YStack><View style={[styles.radio, method === item.id && styles.radioSelected]}>{method === item.id ? <Text style={styles.check}>✓</Text> : null}</View></Pressable>)}</YStack></> : null}</ScrollView><View style={[styles.footer, !payable && styles.paidFooter]}>{payable ? <>{route.params.paymentError ? <Text style={styles.paymentError}>{route.params.paymentError}</Text> : null}<AppButton title="Thanh toán" disabled={submitting} onPress={startPayment} /></> : <View style={styles.paidButton}><Text style={styles.paidButtonText}>{invoice.status === 'PAID' ? 'Đã thanh toán' : 'Đã hủy'}</Text></View>}</View></ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 20, gap: 18 }, total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginVertical: 6 }, totalLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 }, totalAmount: { color: colors.text, fontFamily: typography.regular, fontSize: 28, marginTop: 4 }, detailCard: { padding: 14 }, detailTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15, marginBottom: 10 }, lineItem: { minHeight: 34, borderBottomWidth: 0.8, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, lineLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, flex: 1 }, lineAmount: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, sumRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sumLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 13 }, sumAmount: { color: colors.text, fontFamily: typography.regular, fontSize: 14 }, methods: { gap: 10, marginTop: -4 }, method: { minHeight: 70, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, methodSelected: { backgroundColor: colors.paymentMethodSelected, borderColor: colors.primary }, methodLogo: { width: 40, height: 40, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, sepayLogo: { backgroundColor: colors.fullBackground }, logoText: { color: '#E72020', fontFamily: typography.regular, fontSize: 11 }, sepayText: { color: colors.primary }, methodCopy: { flex: 1 }, methodTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, methodSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 2 }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 0.8, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, check: { color: colors.surface, fontSize: 14, fontFamily: typography.bold }, footer: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: 0.8, borderTopColor: colors.border }, paymentError: { color: colors.error, fontFamily: typography.regular, fontSize: 12, lineHeight: 18, marginBottom: 10 }, paidFooter: { minHeight: 225, justifyContent: 'flex-end', paddingBottom: 20 }, paidButton: { height: 48, backgroundColor: colors.paidButton, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' }, paidButtonText: { color: colors.surface, fontFamily: typography.bold, fontSize: 14 }, missing: { padding: 16, color: colors.text },
});
