import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({ navigation }: Props) {
  const { requestPasswordReset } = useMockAccount();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    const next = validateEmail(email);
    setError(next);
    if (next) return;
    setLoading(true);
    try {
      const isMock = await requestPasswordReset(email.trim());
      navigation.navigate('OtpConfirm', { email: email.trim(), isMock });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không gửi được mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  return <AuthLayout title="Quên mật khẩu" subtitle="Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu." onBack={() => navigation.goBack()}>
    <FormField label="Email" placeholder="ban@email.com" value={email} onChangeText={(value) => { setEmail(value); setError(undefined); }} error={error} keyboardType="email-address" autoComplete="email" />
    <YStack style={styles.button}><AppButton title={loading ? 'Đang gửi mã...' : 'Gửi mã OTP'} onPress={submit} disabled={loading} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ button: { marginTop: 28 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 } });
