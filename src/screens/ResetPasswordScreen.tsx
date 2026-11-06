import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { colors, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import type { FieldErrors } from '../types/validation';
import { validateNewPassword } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ResetPassword'>;
export function ResetPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'password' | 'confirmation'>>({});
  const strength = password.length < 8 ? 0 : password.length < 10 ? 1 : /\d/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 2;
  const submit = () => { const next = validateNewPassword(password, confirmation); setErrors(next); if (Object.keys(next).length === 0) navigation.navigate('ResetSuccess'); };
  return <AuthLayout title="Tạo mật khẩu mới" subtitle="Mật khẩu mới cần có ít nhất 8 ký tự để bảo vệ tài khoản của bạn." onBack={() => navigation.goBack()}>
    <FormField label="Mật khẩu mới" placeholder="Nhập mật khẩu mới" value={password} onChangeText={(value) => { setPassword(value); setErrors((previous) => ({ ...previous, password: undefined })); }} error={errors.password} secure autoComplete="new-password" />
    <YStack style={styles.strength}><XStack style={styles.bars}>{[colors.strengthWeak, colors.strengthMedium, colors.strengthGood, colors.strengthStrong].map((color, index) => <YStack key={color} style={[styles.bar, { backgroundColor: strength > index ? color : colors.border }]} />)}</XStack><Text style={styles.strengthLabel}>{strength === 0 ? 'Độ mạnh mật khẩu' : strength < 3 ? 'Mật khẩu trung bình' : 'Mật khẩu mạnh'}</Text></YStack>
    <YStack style={styles.confirm}><FormField label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu mới" value={confirmation} onChangeText={(value) => { setConfirmation(value); setErrors((previous) => ({ ...previous, confirmation: undefined })); }} error={errors.confirmation} secure autoComplete="new-password" /></YStack>
    <YStack style={styles.button}><AppButton title="Đặt lại mật khẩu" onPress={submit} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ strength: { marginTop: 10 }, bars: { flexDirection: 'row', gap: 6 }, bar: { flex: 1, height: 4, borderRadius: 2 }, strengthLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 6 }, confirm: { marginTop: 19 }, button: { marginTop: 28 } });
