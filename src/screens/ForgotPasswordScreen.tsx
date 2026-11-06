import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const submit = () => { const next = validateEmail(email); setError(next); if (!next) navigation.navigate('OtpConfirm', { email: email.trim() }); };
  return <AuthLayout title="Quên mật khẩu" subtitle="Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu." onBack={() => navigation.goBack()}><FormField label="Email" placeholder="ban@email.com" value={email} onChangeText={(value) => { setEmail(value); setError(undefined); }} error={error} keyboardType="email-address" autoComplete="email" /><YStack style={styles.button}><AppButton title="Gửi mã OTP" onPress={submit} /></YStack></AuthLayout>;
}
const styles = StyleSheet.create({ button: { marginTop: 28 } });
