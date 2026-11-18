import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getPayment, syncPayments } from '../api/student';
import type { PaymentDto } from '../api/student';
import { useInvoices } from '../context/InvoiceContext';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { InvoiceStackParamList } from '../types/navigation';
import { formatVnd } from '../utils/invoice';

type Props = NativeStackScreenProps<InvoiceStackParamList, 'PaymentProcessing'>;
export function PaymentProcessingScreen({ navigation, route }: Props) {
  const { payInvoice, refreshInvoices } = useInvoices();
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    payInvoice(route.params.invoiceId, route.params.method).then((result) => {
      if (!active) return;
      if (result.kind === 'started') setPayment(result.payment);
      else setError(result.kind === 'failed' ? 'Không thể khởi tạo thanh toán. Vui lòng thử lại.' : 'Hóa đơn không còn đủ điều kiện thanh toán.');
    }).catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không thể khởi tạo thanh toán.'); });
    return () => { active = false; };
  }, [payInvoice, route.params.invoiceId, route.params.method, retry]);
  const checkPayment = useCallback(async (force = false) => {
    if (!payment || checking) return;
    setChecking(true);
    try {
      if (force) await syncPayments(true);
      const result = await getPayment(String(payment.paymentId));
      setPayment(result.data);
      if (result.data.paymentStatus === 'SUCCESS') {
        await refreshInvoices().catch(() => undefined);
        navigation.replace('PaymentSuccess', { paymentId: String(result.data.paymentId) });
      } else if (result.data.expired || result.data.paymentStatus === 'EXPIRED' || result.data.paymentStatus === 'FAILED') {
        navigation.popTo('InvoiceDetail', { invoiceId: route.params.invoiceId, paymentError: 'Phiên thanh toán đã kết thúc. Bạn có thể tạo phiên mới và thử lại.' });
      }
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không kiểm tra được trạng thái thanh toán.'); }
    finally { setChecking(false); }
  }, [payment, checking, refreshInvoices, navigation, route.params.invoiceId]);
  useEffect(() => {
    if (!payment || payment.paymentStatus !== 'PENDING' || payment.expired) return;
    const timer = setTimeout(() => { void checkPayment(false); }, 4000);
    return () => clearTimeout(timer);
  }, [payment, checkPayment]);
  return <ScreenContainer><StatusBar style="dark" /><YStack style={styles.outer}><YStack style={styles.group}>
    {!payment ? <ActivityIndicator color={colors.primary} size="large" /> : payment.vietQrUrl ? <Image source={{ uri: payment.vietQrUrl }} contentFit="contain" style={styles.qr} /> : <View style={styles.ring} />}
    <Text style={styles.title}>{payment ? 'Quét mã để thanh toán' : 'Đang tạo phiên thanh toán...'}</Text>
    {payment ? <><Text style={styles.amount}>{formatVnd(Number(payment.expectedAmount))}</Text><Text selectable style={styles.reference}>Nội dung chuyển khoản: {payment.paymentReference}</Text><Text style={styles.message}>Mở ứng dụng ngân hàng và quét mã QR. Màn hình sẽ tự cập nhật khi nhận được thanh toán.</Text></> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {payment ? <AppButton title={checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán · Kiểm tra lại'} loading={checking} onPress={() => void checkPayment(true)} /> : error ? <AppButton title="Thử lại" onPress={() => { setPayment(null); setError(undefined); setRetry((value) => value + 1); }} /> : null}
    <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>Quay lại hóa đơn</Text></Pressable>
  </YStack></YStack></ScreenContainer>;
}
const styles = StyleSheet.create({ outer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }, group: { width: '100%', alignItems: 'center', gap: 14 }, qr: { width: 240, height: 240, backgroundColor: colors.surface }, ring: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: colors.primary }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 17, textAlign: 'center' }, amount: { color: colors.primary, fontFamily: typography.bold, fontSize: 22 }, reference: { color: colors.text, fontFamily: typography.semibold, fontSize: 13, textAlign: 'center' }, message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18, textAlign: 'center' }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12.5, textAlign: 'center' }, back: { padding: 10 }, backText: { color: colors.primary, fontFamily: typography.semibold, fontSize: 13 } });
