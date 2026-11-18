import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail } from '../utils/validation';
import { requestPasswordReset } from '../api/auth';
import { ApiError } from '../api/httpClient';

type Props = NativeStackScreenProps<GuestStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async () => { const next = validateEmail(email); if (next) { setError(next); return; } setBusy(true); setError(undefined); try { await requestPasswordReset(email); navigation.navigate('OtpConfirm', { email: email.trim() }); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không gửi được mã OTP. Vui lòng thử lại.'); } finally { setBusy(false); } };
  return <AuthLayout title="Quên mật khẩu" subtitle="Nhập email đăng ký. Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư." onBack={() => navigation.goBack()}><FormField label="Email" placeholder="ban@email.com" value={email} onChangeText={(value) => { setEmail(value); setError(undefined); }} error={error && validateEmail(email) ? error : undefined} keyboardType="email-address" autoComplete="email" />{error && !validateEmail(email) ? <Text style={styles.error}>{error}</Text> : null}<YStack style={styles.button}><AppButton title={busy ? 'Đang gửi...' : 'Gửi mã OTP'} loading={busy} disabled={busy} onPress={() => void submit()} /></YStack></AuthLayout>;
}
const styles = StyleSheet.create({ button: { marginTop: 28 }, error: { color: '#B42318', fontSize: 12, marginTop: 10 } });
