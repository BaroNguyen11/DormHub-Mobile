import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { YStack } from 'tamagui';
import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { registerAccount } from '../api/auth';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { RegisterForm } from '../types/auth';
import type { GuestStackParamList } from '../types/navigation';
import { validateRegister } from '../utils/validation';
import type { FieldErrors } from '../types/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Register'>;
const initialForm: RegisterForm = { fullName: '', email: '', phone: '', studentCode: '', username: '', password: '', confirmPassword: '', acceptedTerms: true };
export function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors<keyof RegisterForm>>({});
  const [requestError, setRequestError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => { setForm((previous) => ({ ...previous, [key]: value })); setErrors((previous) => ({ ...previous, [key]: undefined })); setRequestError(undefined); };
  const submit = async () => {
    if (savingRef.current) return;
    const validation = validateRegister(form); setErrors(validation);
    if (Object.keys(validation).length) return;
    savingRef.current = true; setSaving(true); setRequestError(undefined);
    try {
      await registerAccount({ username: form.username.trim(), email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), phoneNumber: form.phone.replace(/[\s.-]/g, ''), studentCode: form.studentCode.trim() });
      navigation.replace('RegisterSuccess');
    } catch (cause) { setRequestError(cause instanceof ApiError ? cause.message : 'Không thể tạo tài khoản. Vui lòng thử lại.'); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return <AuthLayout title="Tạo tài khoản" subtitle="Đăng ký bằng thông tin sinh viên do nhà trường cấp." onBack={() => navigation.goBack()}>
    <YStack style={styles.fields}>
      <FormField label="Họ và tên" placeholder="Nguyễn Văn A" value={form.fullName} onChangeText={(value) => setField('fullName', value)} error={errors.fullName} autoCapitalize="words" autoComplete="name" />
      <FormField label="Email" placeholder="ban@email.com" value={form.email} onChangeText={(value) => setField('email', value)} error={errors.email} keyboardType="email-address" autoComplete="email" />
      <FormField label="Mã sinh viên (8 chữ số)" placeholder="23647241" value={form.studentCode} onChangeText={(value) => setField('studentCode', value.replace(/\D/g, '').slice(0, 8))} error={errors.studentCode} keyboardType="number-pad" />
      <FormField label="Số điện thoại" placeholder="0901234567" value={form.phone} onChangeText={(value) => setField('phone', value)} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" />
      <FormField label="Username" placeholder="Tên đăng nhập" value={form.username} onChangeText={(value) => setField('username', value)} error={errors.username} autoComplete="username" />
      <FormField label="Mật khẩu" placeholder="Tối thiểu 8 ký tự" value={form.password} onChangeText={(value) => setField('password', value)} error={errors.password} secure autoComplete="new-password" />
      <FormField label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChangeText={(value) => setField('confirmPassword', value)} error={errors.confirmPassword} secure autoComplete="new-password" />
    </YStack>
    {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
    <YStack style={styles.submit}><AppButton title={saving ? 'Đang đăng ký...' : 'Đăng ký'} loading={saving} disabled={saving} onPress={() => void submit()} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ fields: { gap: 15 }, submit: { marginTop: 20 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginTop: 10 } });
