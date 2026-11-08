import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, typography } from '../theme';
import type { ProfileStackParamList, RootStackParamList, StudentTabsParamList } from '../types/navigation';
import type { ChangePasswordForm } from '../types/profile';
import type { FieldErrors } from '../types/validation';
import { validateChangePassword } from '../utils/validation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;
const emptyForm: ChangePasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ChangePasswordScreen({ navigation }: Props) {
  const { changePassword, logout, isAuthenticated, accountId } = useMockAccount();
  const [form, setForm] = useState<ChangePasswordForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors<keyof ChangePasswordForm>>({});
  const [serverError, setServerError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const backendAccount = isAuthenticated && accountId === null;
  const setField = (key: keyof ChangePasswordForm, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setServerError(undefined);
  };
  const submit = async () => {
    const nextErrors = validateChangePassword(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    setServerError(undefined);
    try {
      const result = await changePassword(form.currentPassword, form.newPassword);
      if (result === 'incorrect') { setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng.' }); return; }
      if (result === 'invalid') { setErrors({ newPassword: 'Mật khẩu mới không hợp lệ.' }); return; }
      if (result !== 'success') return;
      setForm(emptyForm);
      if (backendAccount) {
        Alert.alert('Đổi mật khẩu thành công', 'Mật khẩu của bạn đã được cập nhật.', [{ text: 'Đóng', onPress: () => navigation.goBack() }]);
        return;
      }
      await logout();
      navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>()?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({ index: 0, routes: [{ name: 'Guest', params: { screen: 'PasswordChangeSuccess' } }] });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return <ScreenContainer>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
      <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.fields}>
        <FormField label="Mật khẩu hiện tại" value={form.currentPassword} onChangeText={(value) => setField('currentPassword', value)} placeholder="••••••••" secure autoComplete="current-password" error={errors.currentPassword} />
        <FormField label="Mật khẩu mới (6–50 ký tự)" value={form.newPassword} onChangeText={(value) => setField('newPassword', value)} placeholder="Nhập mật khẩu mới" secure autoComplete="new-password" error={errors.newPassword} />
        <FormField label="Xác nhận mật khẩu mới" value={form.confirmPassword} onChangeText={(value) => setField('confirmPassword', value)} placeholder="Nhập lại mật khẩu mới" secure autoComplete="new-password" error={errors.confirmPassword} />
      </View>
      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
      <View style={styles.submit}><AppButton title={loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'} onPress={submit} disabled={loading} /></View>
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
  serverError: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginTop: 12 },
});
