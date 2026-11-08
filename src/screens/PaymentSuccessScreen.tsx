import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getStudentInvoice } from '../api/invoices';
import { getStudentPayment } from '../api/payments';
import type { InvoicePaymentTransaction } from '../api/payments';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatMoney } from '../utils/billing';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentSuccess'>;
export function PaymentSuccessScreen({ navigation, route }: Props) {
  const parsed = /^\d+$/.test(route.params.paymentId) ? Number(route.params.paymentId) : 0;
  const paymentId = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  const [confirmed, setConfirmed] = useState<InvoicePaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setConfirmed(null);
    setError(undefined);
    if (paymentId == null) { setError('Không tìm thấy giao dịch.'); setLoading(false); return () => { active = false; }; }
    void (async () => {
      try {
        const payment = await getStudentPayment(paymentId);
        const invoice = await getStudentInvoice(payment.invoiceId);
        if (!active) return;
        if (payment.paymentStatus === 'SUCCESS' && invoice.status === 'PAID') setConfirmed(payment);
        else setError('Giao dịch chưa được xác nhận hoàn tất. Vui lòng kiểm tra lại.');
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không thể xác nhận giao dịch.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [paymentId, reload]));

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Thanh toán" onBack={() => navigation.popTo('InvoiceList')} />
    <View style={styles.content}>
      {loading ? <Text style={styles.message}>Đang xác nhận thanh toán...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {confirmed ? <SurfaceCard><Text style={styles.title}>Thanh toán thành công</Text>
        <DetailRow label="Mã giao dịch" value={String(confirmed.paymentId)} />
        <DetailRow label="Mã hóa đơn" value={String(confirmed.invoiceId)} />
        <DetailRow label="Số tiền" value={formatMoney(confirmed.expectedAmount)} last /></SurfaceCard> : null}
      {!loading && !confirmed ? <AppButton title="Kiểm tra lại" variant="outline" onPress={() => setReload((value) => value + 1)} /> : null}
      {confirmed ? <AppButton title="Về danh sách hóa đơn" onPress={() => navigation.popTo('InvoiceList')} /> : null}
    </View>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 }, title: { color: colors.success, fontFamily: typography.bold, fontSize: 18, marginBottom: 10 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 13 },
});
