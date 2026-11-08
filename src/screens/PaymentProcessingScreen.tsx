import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getStudentInvoice } from '../api/invoices';
import { getStudentPayment } from '../api/payments';
import type { InvoicePaymentTransaction } from '../api/payments';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatMoney } from '../utils/billing';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentProcessing'>;
export function PaymentProcessingScreen({ navigation, route }: Props) {
  const parsedPaymentId = /^\d+$/.test(route.params.paymentId) ? Number(route.params.paymentId) : 0;
  const parsedInvoiceId = /^\d+$/.test(route.params.invoiceId) ? Number(route.params.invoiceId) : 0;
  const paymentId = Number.isSafeInteger(parsedPaymentId) && parsedPaymentId > 0 ? parsedPaymentId : null;
  const invoiceId = Number.isSafeInteger(parsedInvoiceId) && parsedInvoiceId > 0 ? parsedInvoiceId : null;
  const [payment, setPayment] = useState<InvoicePaymentTransaction | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    let inFlight = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    if (paymentId == null || invoiceId == null) { setError('Không tìm thấy giao dịch.'); return () => { active = false; }; }
    const check = async () => {
      if (inFlight) return;
      inFlight = true;
      setChecking(true);
      setError(undefined);
      try {
        const result = await getStudentPayment(paymentId);
        if (!active) return;
        if (result.invoiceId !== invoiceId) throw new Error('Thông tin giao dịch chưa khớp hóa đơn.');
        setPayment(result);
        if (result.paymentStatus === 'EXPIRED' || result.paymentStatus === 'CANCELLED' || result.expired) {
          if (timer) clearInterval(timer);
        }
        if (result.paymentStatus === 'SUCCESS') {
          const latestInvoice = await getStudentInvoice(invoiceId);
          if (active && latestInvoice.status === 'PAID') navigation.replace('PaymentSuccess', { paymentId: String(paymentId) });
          else if (active) setError('Giao dịch đã được ghi nhận. Đang chờ xác nhận hóa đơn.');
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không thể kiểm tra giao dịch.');
      } finally {
        inFlight = false;
        if (active) setChecking(false);
      }
    };
    void check();
    timer = setInterval(() => { void check(); }, 10_000);
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [paymentId, invoiceId, navigation, reload]));

  const openQr = async () => {
    if (!payment?.vietQrUrl) return;
    try { await Linking.openURL(payment.vietQrUrl); }
    catch { setError('Không thể mở mã thanh toán. Vui lòng thử lại.'); }
  };
  const pending = payment?.paymentStatus === 'PENDING' && !payment.expired;
  const status = payment?.expired ? 'Đã hết hạn' : payment?.paymentStatus === 'PENDING' ? 'Đang chờ thanh toán' :
    payment?.paymentStatus === 'CANCELLED' ? 'Đã hủy' : payment?.paymentStatus === 'EXPIRED' ? 'Đã hết hạn' : 'Đang xác nhận';

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Thanh toán" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!payment && !error ? <Text style={styles.message}>Đang tải giao dịch...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {payment ? <>
        <SurfaceCard><Text style={styles.heading}>{status}</Text>
          <DetailRow label="Số tiền" value={formatMoney(payment.expectedAmount)} />
          <DetailRow label="Ngân hàng" value={payment.receivingBankCode} />
          <DetailRow label="Số tài khoản" value={payment.receivingAccountNumber} last />
          <View style={styles.reference}><Text style={styles.message}>Nội dung chuyển khoản</Text>
            <Text selectable style={styles.referenceValue}>{payment.paymentReference}</Text>
            <Text style={styles.hint}>Nhấn giữ nội dung để sao chép.</Text></View></SurfaceCard>
        {pending && payment.vietQrUrl ? <SurfaceCard style={styles.qrCard}>
          <Image source={{ uri: payment.vietQrUrl }} style={styles.qr} contentFit="contain" accessibilityLabel="Mã VietQR của giao dịch" />
          <AppButton title="Mở mã VietQR" variant="outline" onPress={() => void openQr()} /></SurfaceCard> : null}
        {pending ? <Text style={styles.message}>Chỉ chuyển đúng số tiền và nội dung do hệ thống cung cấp. Trạng thái sẽ được cập nhật sau khi ngân hàng xác nhận.</Text> : null}
        {payment.expired || payment.paymentStatus === 'CANCELLED' ? <Text style={styles.message}>Giao dịch này không còn hiệu lực. Hãy quay lại hóa đơn để kiểm tra trạng thái trước khi tạo giao dịch mới.</Text> : null}
      </> : null}
      <AppButton title={checking ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái'} variant="outline" disabled={checking} onPress={() => setReload((value) => value + 1)} />
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 28 }, heading: { color: colors.text, fontFamily: typography.bold, fontSize: 17, marginBottom: 10 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 13 },
  qrCard: { alignItems: 'center', gap: 14 }, qr: { width: 230, height: 230 },
  reference: { marginTop: 10, gap: 4 }, referenceValue: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  hint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 },
});
