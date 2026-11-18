import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/httpClient';
import { colors, radius, typography } from '../theme';
import type { LoginForm } from '../types/auth';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail, validateLogin } from '../utils/validation';
import { authDevLog } from '../utils/authDiagnostics';

type Props = NativeStackScreenProps<GuestStackParamList, 'Login'>;
export function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useAuth();
  const [form, setForm] = useState<LoginForm>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [status, setStatus] = useState(route.params?.status);
  const [requestError, setRequestError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const setField = (key: keyof LoginForm, value: string) => { setForm((previous) => ({ ...previous, [key]: value })); setErrors((previous) => ({ ...previous, [key]: undefined })); setStatus(undefined); setRequestError(undefined); };
  const submit = async () => {
    authDevLog('Login button pressed');
    if (submittingRef.current) return;
    try {
      const nextErrors = validateLogin(form);
      const emailError = validateEmail(form.identifier);
      if (!nextErrors.identifier && emailError) nextErrors.identifier = emailError;
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        authDevLog('Validation failed');
        return;
      }
      authDevLog('Validation passed');
      submittingRef.current = true;
      setSubmitting(true);
      setRequestError(undefined);
      await signIn(form.identifier, form.password);
      setForm({ identifier: '', password: '' });
    } catch (error) {
      authDevLog('signIn failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
      setRequestError(error instanceof ApiError ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.');
      setForm((previous) => ({ ...previous, password: '' }));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  return (
    <AuthLayout title="Đăng nhập" subtitle={status === 'pending' ? undefined : 'Chào mừng bạn quay lại DormHub'} onBack={() => navigation.goBack()} hideBack={status === 'pending'}>
      {status === 'pending' ? <XStack style={styles.warning}><Feather name="clock" color={colors.warningIcon} size={18} /><Text style={styles.warningText}>Tài khoản đang chờ duyệt. Manager sẽ xác nhận tài khoản của bạn trong 1-2 ngày làm việc.</Text></XStack> : null}
      {status === 'invalid' ? <Text style={styles.error}>Email hoặc mật khẩu chưa đúng.</Text> : null}
      {status === 'verified' ? <Text style={styles.verified}>{route.params?.message ?? 'Email đã được xác thực. Bạn có thể đăng nhập.'}</Text> : null}
      {requestError ? <Text style={styles.error}>{requestError}</Text> : null}
      <YStack style={styles.fields}>
        <FormField label="Email" value={form.identifier} onChangeText={(value) => setField('identifier', value)} placeholder="Email do nhà trường cấp" autoComplete="email" error={errors.identifier} />
        <FormField label="Mật khẩu" value={form.password} onChangeText={(value) => setField('password', value)} placeholder="Nhập mật khẩu" secure autoComplete="current-password" error={errors.password} />
      </YStack>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}><Text style={styles.link}>Quên mật khẩu?</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('ActivateAccount')} style={styles.activate}><Text style={styles.link}>Kích hoạt tài khoản</Text></Pressable>
      <YStack style={styles.submit}><AppButton title={submitting ? 'Đang đăng nhập...' : 'Đăng nhập'} onPress={() => void submit()} disabled={status === 'pending' || submitting} loading={submitting} /></YStack>
      <XStack style={styles.footer}><Text style={styles.footerText}>Tài khoản sinh viên do nhà trường cấp.</Text></XStack>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 18 }, forgot: { alignSelf: 'flex-end', marginTop: 12 }, link: { color: colors.primary, fontFamily: typography.semibold, fontSize: 13 }, submit: { marginTop: 27 }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 23 }, footerText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  warning: { backgroundColor: colors.limitedBackground, borderRadius: radius.button, flexDirection: 'row', gap: 10, padding: 12, marginBottom: 18 }, warningText: { flex: 1, color: colors.warningText, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginBottom: 12 }, verified: { color: colors.availableText, fontFamily: typography.semibold, fontSize: 12, marginBottom: 12 }, activate: { alignSelf: 'center', marginTop: 20 },
});
