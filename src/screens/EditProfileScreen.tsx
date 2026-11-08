import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const { profile, updateProfile, saveStudentProfile, isAuthenticated, accountId } = useMockAccount();
  const [form, setForm] = useState<ProfileEditForm>({
    fullName: profile?.fullName ?? '', email: profile?.email ?? '',
    phone: profile?.phone ?? '', avatarUri: profile?.avatarUri ?? null,
  });
  const [errors, setErrors] = useState<FieldErrors<'fullName' | 'email' | 'phone'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [formTouched, setFormTouched] = useState(false);
  const isApiAccount = isAuthenticated && !accountId;
  useEffect(() => {
    if (formTouched || !profile) return;
    setForm({ fullName: profile.fullName, email: profile.email, phone: profile.phone, avatarUri: profile.avatarUri });
  }, [formTouched, profile]);
  const setField = <K extends keyof ProfileEditForm>(key: K, value: ProfileEditForm[K]) => {
    setFormTouched(true);
    setForm((previous) => ({ ...previous, [key]: value }));
    if (key !== 'avatarUri') setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const pickAvatar = async () => {
    if (isApiAccount) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (!result.canceled && result.assets[0]) setField('avatarUri', result.assets[0].uri);
    } catch {
      Alert.alert('Không thể chọn ảnh', 'Vui lòng thử lại trên thiết bị.');
    }
  };
  const save = async () => {
    const nextErrors = validateProfileEdit(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !profile) return;
    setIsSaving(true);
    setServerError(undefined);
    try {
      if (isApiAccount) await saveStudentProfile({ phone: form.phone.trim() });
      else updateProfile({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() });
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
      <Pressable accessibilityRole="button" onPress={isApiAccount ? undefined : pickAvatar} style={styles.avatarArea}>
        <ProfileAvatar profile={{ ...profile, fullName: form.fullName, avatarUri: form.avatarUri }} size={78} camera={!isApiAccount} />
        <Text style={styles.changeAvatar}>{isApiAccount ? 'Chưa thể cập nhật ảnh đại diện' : 'Change avatar'}</Text>
      </Pressable>
      <View style={styles.fields}>
        <FormField label="Họ và tên" value={form.fullName} onChangeText={(value) => setField('fullName', value)} placeholder="Họ và tên" autoComplete="name" autoCapitalize="words" error={errors.fullName} editable={!isApiAccount} />
        <FormField label="Email" value={form.email} onChangeText={(value) => setField('email', value)} placeholder="Email" keyboardType="email-address" autoComplete="email" error={errors.email} editable={!isApiAccount} />
        <FormField label="Số điện thoại" value={form.phone} onChangeText={(value) => setField('phone', value)} placeholder="Số điện thoại" keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
        <FormField label="MSSV" value={profile.studentId ?? ''} onChangeText={() => {}} placeholder="Chưa cập nhật" editable={false} helperText="Không thể chỉnh sửa mã số sinh viên" />
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
  save: { marginTop: 20 },
  missing: { color: colors.textSecondary, fontFamily: typography.regular, padding: 16 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginTop: 12 },
});
