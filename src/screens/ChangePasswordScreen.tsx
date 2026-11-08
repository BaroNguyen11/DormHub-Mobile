import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { useAuth } from '../context/AuthContext';
import { changePassword as changePasswordApi } from '../api/auth';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';
import type { ChangePasswordForm } from '../types/profile';
import type { FieldErrors } from '../types/validation';
import { validateChangePassword } from '../utils/validation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;
const emptyForm: ChangePasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ChangePasswordScreen({ navigation }: Props) {
  const auth = useAuth();
  const { changePassword, logout } = useMockAccount();
  const [form, setForm] = useState<ChangePasswordForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<keyof ChangePasswordForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const setField = (key: keyof ChangePasswordForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setRequestError(null);
  };
  const submit = async () => {
    if (submittingRef.current) return;
    const nextErrors = validateChangePassword(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (auth.status === 'authenticated') {
      submittingRef.current = true;
      setSubmitting(true);
      setRequestError(null);
      try {
        await changePasswordApi(form.currentPassword, form.newPassword, form.confirmPassword);
        setForm(emptyForm);
        Alert.alert('Đổi mật khẩu thành công', 'Mật khẩu đã được cập nhật.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } catch (error) {
        if (error instanceof ApiError && error.code === 'OLD_PASSWORD_INCORRECT') setErrors({ currentPassword: error.message });
        else if (error instanceof ApiError && error.code === 'PASSWORD_CONFIRM_NOT_MATCH') setErrors({ confirmPassword: error.message });
        else if (error instanceof ApiError && error.code === 'NEW_PASSWORD_SAME_AS_OLD') setErrors({ newPassword: error.message });
        else setRequestError(error instanceof ApiError ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
      return;
    }
    const result = changePassword(form.currentPassword, form.newPassword);
    if (result === 'incorrect') { setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' }); return; }
    if (result === 'invalid') { setErrors({ newPassword: 'Mật khẩu mới không hợp lệ' }); return; }
    if (result !== 'success') return;
    setForm(emptyForm);
    logout('PasswordChangeSuccess');
  };

  return <ScreenContainer>
    <StatusBar style="dark" />
    <XStack style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
      <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
    </XStack>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {requestError ? <Text style={styles.requestError}>{requestError}</Text> : null}
      <YStack style={styles.fields}>
        <FormField label="Mật khẩu hiện tại" value={form.currentPassword} onChangeText={(value) => setField('currentPassword', value)} placeholder="••••••••" secure autoComplete="current-password" error={errors.currentPassword} />
        <FormField label="Mật khẩu mới" value={form.newPassword} onChangeText={(value) => setField('newPassword', value)} placeholder="Tối thiểu 8 ký tự" secure autoComplete="new-password" error={errors.newPassword} />
        <FormField label="Xác nhận mật khẩu mới" value={form.confirmPassword} onChangeText={(value) => setField('confirmPassword', value)} placeholder="Nhập lại mật khẩu mới" secure autoComplete="new-password" error={errors.confirmPassword} />
      </YStack>
      <YStack style={styles.submit}><AppButton title={submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'} onPress={() => void submit()} loading={submitting} /></YStack>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  fields: { gap: 18 },
  submit: { marginTop: 20 },
  requestError: { color: colors.error, fontFamily: typography.regular, marginBottom: 12 },
});
