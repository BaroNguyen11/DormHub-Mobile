import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import type { FieldErrors } from '../types/validation';
import { validateNewPassword } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { resetPassword } = useMockAccount();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'password' | 'confirmation'>>({});
  const [serverError, setServerError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const strength = password.length < 8 ? 0 : password.length < 10 ? 1 : /\d/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 2;
  const submit = async () => {
    if (submittingRef.current) return;
    const next = validateNewPassword(password, confirmation);
    setErrors(next);
    if (Object.keys(next).length) return;
    submittingRef.current = true;
    setLoading(true);
    setServerError(undefined);
    try {
      await resetPassword(route.params.email, route.params.otp, password);
      setPassword('');
      setConfirmation('');
      navigation.reset({ index: 1, routes: [{ name: 'Login' }, { name: 'ResetSuccess' }] });
    } catch (resetError) {
      setServerError(resetError instanceof Error ? resetError.message : 'Không đặt lại được mật khẩu. Vui lòng thử lại.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return <AuthLayout title="Tạo mật khẩu mới" subtitle="Mật khẩu mới cần có ít nhất 8 ký tự để bảo vệ tài khoản của bạn." onBack={() => navigation.goBack()}>
    <FormField label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" value={password} onChangeText={(value) => { setPassword(value); setErrors((previous) => ({ ...previous, password: undefined })); setServerError(undefined); }} error={errors.password} secure autoComplete="new-password" />
    <YStack style={styles.strength}><XStack style={styles.bars}>{[colors.strengthWeak, colors.strengthMedium, colors.strengthGood, colors.strengthStrong].map((color, index) => <YStack key={color} style={[styles.bar, { backgroundColor: strength > index ? color : colors.border }]} />)}</XStack><Text style={styles.strengthLabel}>{strength === 0 ? 'Độ mạnh mật khẩu' : strength < 3 ? 'Mật khẩu trung bình' : 'Mật khẩu mạnh'}</Text></YStack>
    <YStack style={styles.confirm}><FormField label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu mới" value={confirmation} onChangeText={(value) => { setConfirmation(value); setErrors((previous) => ({ ...previous, confirmation: undefined })); setServerError(undefined); }} error={errors.confirmation} secure autoComplete="new-password" /></YStack>
    {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
    <YStack style={styles.button}><AppButton title={loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'} onPress={() => void submit()} disabled={loading} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ strength: { marginTop: 10 }, bars: { flexDirection: 'row', gap: 6 }, bar: { flex: 1, height: 4, borderRadius: 2 }, strengthLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 6 }, confirm: { marginTop: 19 }, button: { marginTop: 28 }, serverError: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginTop: 12 } });
