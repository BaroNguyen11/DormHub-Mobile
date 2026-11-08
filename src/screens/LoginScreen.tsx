import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, radius, typography } from '../theme';
import type { LoginForm } from '../types/auth';
import type { GuestStackParamList, RootStackParamList } from '../types/navigation';
import { validateLogin } from '../utils/validation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<GuestStackParamList, 'Login'>;
export function LoginScreen({ navigation, route }: Props) {
  const { authenticate, activateAuthenticatedAccount, activateDevAccount } = useMockAccount();
  const [form, setForm] = useState<LoginForm>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [status, setStatus] = useState(route.params?.status);
  const [serverError, setServerError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const setField = (key: keyof LoginForm, value: string) => { setForm((previous) => ({ ...previous, [key]: value })); setErrors((previous) => ({ ...previous, [key]: undefined })); setStatus(undefined); setServerError(undefined); };
  const submit = async () => {
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const result = await authenticate(form);
      if (result.kind === 'api') {
        await activateAuthenticatedAccount(result.user);
        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({ index: 0, routes: [{ name: 'Student' }] });
      } else if (result.kind === 'success') {
        activateDevAccount(result.accountId);
        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({ index: 0, routes: [{ name: 'Student' }] });
      } else {
        setStatus(result.kind);
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout title="Đăng nhập" subtitle={status === 'pending' ? undefined : 'Chào mừng bạn quay lại DormHub'} onBack={() => navigation.goBack()} hideBack={status === 'pending'}>
      {status === 'pending' ? <XStack style={styles.warning}><Feather name="clock" color={colors.warningIcon} size={18} /><Text style={styles.warningText}>Tài khoản đang chờ duyệt. Manager sẽ xác nhận tài khoản của bạn trong 1-2 ngày làm việc.</Text></XStack> : null}
      {status === 'invalid' ? <Text style={styles.error}>Email hoặc mật khẩu chưa đúng.</Text> : null}
      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
      <YStack style={styles.fields}>
        <FormField label="Email" value={form.identifier} onChangeText={(value) => setField('identifier', value)} placeholder="sinhvien@example.com" keyboardType="email-address" autoComplete="email" error={errors.identifier} />
        <FormField label="Mật khẩu" value={form.password} onChangeText={(value) => setField('password', value)} placeholder="Nhập mật khẩu" secure autoComplete="current-password" error={errors.password} />
      </YStack>
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}><Text style={styles.link}>Quên mật khẩu?</Text></Pressable>
      <YStack style={styles.submit}><AppButton title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'} onPress={submit} disabled={loading || status === 'pending'} /></YStack>
      <XStack style={styles.footer}><Text style={styles.footerText}>Chưa có tài khoản? </Text><Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Đăng ký ngay</Text></Pressable></XStack>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 18 }, forgot: { alignSelf: 'flex-end', marginTop: 12 }, link: { color: colors.primary, fontFamily: typography.semibold, fontSize: 13 }, submit: { marginTop: 27 }, footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 23 }, footerText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  warning: { backgroundColor: colors.limitedBackground, borderRadius: radius.button, flexDirection: 'row', gap: 10, padding: 12, marginBottom: 18 }, warningText: { flex: 1, color: colors.warningText, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginBottom: 12 },
});
