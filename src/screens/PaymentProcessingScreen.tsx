import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { YStack } from 'tamagui';

import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useInvoices } from '../context/InvoiceContext';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentProcessing'>;
export function PaymentProcessingScreen({ navigation, route }: Props) {
  const { payInvoice } = useInvoices();
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = payInvoice(route.params.invoiceId, route.params.method);
      if (result.kind === 'success') navigation.replace('PaymentSuccess', { paymentId: result.payment.id });
      else navigation.popTo('InvoiceDetail', {
        invoiceId: route.params.invoiceId,
        paymentError: result.kind === 'failed'
          ? 'Thanh toán mô phỏng thất bại. Hóa đơn chưa được thanh toán; vui lòng kiểm tra và thử lại.'
          : 'Hóa đơn không còn đủ điều kiện thanh toán. Vui lòng kiểm tra lại.',
      });
    }, 1400);
    return () => clearTimeout(timer);
  }, [navigation, payInvoice, route.params.invoiceId, route.params.method]);
  return <ScreenContainer><StatusBar style="dark" /><YStack style={styles.outer}><YStack style={styles.group}><View style={styles.ring} /><Text style={styles.title}>Đang xử lý thanh toán...</Text><Text style={styles.message}>Đây là giao dịch mô phỏng. Chưa có xác nhận từ cổng thanh toán thật.</Text></YStack></YStack></ScreenContainer>;
}
const styles = StyleSheet.create({ outer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }, group: { alignItems: 'center', marginTop: -20 }, ring: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: colors.primary }, title: { color: colors.text, fontFamily: typography.regular, fontSize: 17, marginTop: 18 }, message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 10 } });
