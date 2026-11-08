import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { useMockAccount } from '../context/MockAccountContext';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({ navigation }: Props) {
  const { requestPasswordReset } = useMockAccount();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const nextRequestAtRef = useRef(0);
  const submit = async () => {
    if (submittingRef.current) return;
    const next = validateEmail(email);
    setError(next);
    if (next) return;
    if (Date.now() < nextRequestAtRef.current) {
      setError('Vui lòng chờ một phút trước khi yêu cầu mã mới.');
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      nextRequestAtRef.current = Date.now() + 60_000;
      navigation.navigate('OtpConfirm', { email: email.trim() });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không gửi được mã OTP. Vui lòng thử lại.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };
  return <AuthLayout title="Quên mật khẩu" subtitle="Nhập email của bạn để yêu cầu mã đặt lại mật khẩu." onBack={() => navigation.goBack()}>
    <FormField label="Email" placeholder="ban@email.com" value={email} onChangeText={(value) => { setEmail(value); setError(undefined); }} error={error} keyboardType="email-address" autoComplete="email" />
    <YStack style={styles.button}><AppButton title={loading ? 'Đang gửi yêu cầu...' : 'Gửi mã OTP'} onPress={() => void submit()} disabled={loading} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ button: { marginTop: 28 } });
