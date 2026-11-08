import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ProfileAvatar } from '../components/ui/ProfileUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';
import type { ProfileEditForm } from '../types/profile';
import type { FieldErrors } from '../types/validation';
import { validateProfileEdit } from '../utils/validation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { profile, saveStudentProfile } = useMockAccount();
  const [form, setForm] = useState<ProfileEditForm>({
    fullName: profile?.fullName ?? '', email: profile?.email ?? '',
    phone: profile?.phone ?? '', avatarUri: profile?.avatarUri ?? null,
  });
  const [errors, setErrors] = useState<FieldErrors<'fullName' | 'email' | 'phone'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [formTouched, setFormTouched] = useState(false);
  useEffect(() => {
    if (formTouched || !profile) return;
    setForm({ fullName: profile.fullName, email: profile.email, phone: profile.phone, avatarUri: profile.avatarUri });
  }, [formTouched, profile]);
  const setField = <K extends keyof ProfileEditForm>(key: K, value: ProfileEditForm[K]) => {
    setFormTouched(true);
    setForm((previous) => ({ ...previous, [key]: value }));
    if (key !== 'avatarUri') setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const save = async () => {
    const nextErrors = validateProfileEdit(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !profile) return;
    setIsSaving(true);
    setServerError(undefined);
    try {
      await saveStudentProfile({ phone: form.phone.trim() });
      navigation.goBack();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return <ScreenContainer><Text style={styles.missing}>Không có thông tin tài khoản.</Text></ScreenContainer>;

  return <ScreenContainer>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
      <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.avatarArea}>
        <ProfileAvatar profile={profile} size={78} camera={false} />
        <Text style={styles.changeAvatar}>Chưa thể cập nhật ảnh đại diện</Text>
      </View>
      <View style={styles.fields}>
        <FormField label="Họ và tên" value={form.fullName} onChangeText={() => {}} placeholder="Họ và tên" autoComplete="name" autoCapitalize="words" error={errors.fullName} editable={false} />
        <FormField label="Email" value={form.email} onChangeText={() => {}} placeholder="Email" keyboardType="email-address" autoComplete="email" error={errors.email} editable={false} />
        <FormField label="Số điện thoại" value={form.phone} onChangeText={(value) => setField('phone', value)} placeholder="Số điện thoại" keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
        <FormField label="MSSV" value={profile.studentId ?? ''} onChangeText={() => {}} placeholder="Chưa cập nhật" editable={false} helperText="Không thể chỉnh sửa mã số sinh viên" />
        <FormField label="Số CCCD" value={profile.cic ? `********${profile.cic.slice(-4)}` : 'Chưa cập nhật'} onChangeText={() => {}} placeholder="Chưa cập nhật" editable={false} helperText="Chọn Cập nhật CCCD để thay đổi số căn cước" />
      </View>
      <View style={styles.verifyButton}>
        <AppButton title="Cập nhật CCCD" variant="outline" onPress={() => navigation.navigate('CCCDInput')} />
      </View>
      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
      <View style={styles.save}><AppButton title={isSaving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={save} disabled={isSaving} /></View>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  avatarArea: { alignItems: 'center', marginBottom: 20 },
  changeAvatar: { color: colors.primary, fontFamily: typography.bold, fontSize: 13, marginTop: 8 },
  fields: { gap: 18 },
  verifyButton: { marginTop: 16 },
  save: { marginTop: 20 },
  missing: { color: colors.textSecondary, fontFamily: typography.regular, padding: 16 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginTop: 12 },
});
