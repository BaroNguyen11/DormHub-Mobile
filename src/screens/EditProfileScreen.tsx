import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ProfileAvatar, validRemoteAvatarUrl } from '../components/ui/ProfileUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getStudentProfile, updateStudentProfile } from '../api/studentProfile';
import { ApiError } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';
import type { ProfileEditForm } from '../types/profile';
import type { FieldErrors } from '../types/validation';
import type { StudentProfile } from '../types/studentProfile';
import { validateProfileEdit, validateStudentPhone } from '../utils/validation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const isReal = auth.status === 'authenticated';
  const { accountId, profile, updateProfile } = useMockAccount();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(isReal);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState<ProfileEditForm>({
    fullName: profile?.fullName ?? '', email: profile?.email ?? '',
    phone: profile?.phone ?? '', avatarUri: profile?.avatarUri ?? null,
  });
  const [errors, setErrors] = useState<FieldErrors<'fullName' | 'email' | 'phone'>>({});
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const pickingRef = useRef(false);
  const editingAccountId = useRef(profile?.accountId ?? null);
  useEffect(() => {
    if (!isReal) return;
    let active = true;
    setProfileLoading(true);
    setProfileError(null);
    setStudentProfile(null);
    getStudentProfile()
      .then((result) => {
        if (!active) return;
        setStudentProfile(result.data ?? null);
        if (result.data) setForm({ fullName: result.data.fullName ?? '', email: result.data.email ?? '', phone: result.data.phone ?? '', avatarUri: validRemoteAvatarUrl(result.data.avatarUrl) });
      })
      .catch(() => { if (active) setProfileError('Không tải được hồ sơ sinh viên.'); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [isReal, reloadKey]);
  useEffect(() => {
    if (isReal) return;
    if (editingAccountId.current === profile?.accountId) return;
    editingAccountId.current = profile?.accountId ?? null;
    setForm({ fullName: profile?.fullName ?? '', email: profile?.email ?? '', phone: profile?.phone ?? '', avatarUri: profile?.avatarUri ?? null });
    setErrors({});
  }, [isReal, profile?.accountId]);
  const setField = <K extends keyof ProfileEditForm>(key: K, value: ProfileEditForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (key !== 'avatarUri') setErrors((previous) => ({ ...previous, [key]: undefined }));
  };
  const pickAvatar = async () => {
    if (isReal) return;
    if (pickingRef.current || savingRef.current) return;
    pickingRef.current = true;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (result.canceled) return;
      if (!result.assets[0]?.uri) { Alert.alert('Không thể chọn ảnh', 'Ảnh được chọn không hợp lệ. Vui lòng thử lại.'); return; }
      setField('avatarUri', result.assets[0].uri);
    } catch {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync().catch(() => null);
      Alert.alert('Không thể chọn ảnh', permission?.status === 'denied' ? 'Ứng dụng chưa có quyền truy cập ảnh. Vui lòng kiểm tra quyền trong cài đặt thiết bị.' : 'Vui lòng thử lại trên thiết bị.');
    } finally {
      pickingRef.current = false;
    }
  };
  const save = async () => {
    if (savingRef.current) return;
    if (isReal) {
      if (!studentProfile) return;
      const phone = form.phone.replace(/[\s.-]/g, '');
      if (phone === (studentProfile.phone ?? '')) { navigation.goBack(); return; }
      const phoneError = validateStudentPhone(phone);
      setErrors(phoneError ? { phone: phoneError } : {});
      if (phoneError) return;
      savingRef.current = true;
      setSaving(true);
      try {
        await updateStudentProfile({ phone });
        navigation.goBack();
      } catch (error) {
        Alert.alert('Không thể cập nhật', error instanceof ApiError ? error.message : 'Không kết nối được Backend. Vui lòng thử lại.');
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
      return;
    }
    const nextErrors = validateProfileEdit(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !profile) return;
    savingRef.current = true;
    setSaving(true);
    try {
      // Small local delay makes the mock saving state visible; no upload or API call occurs.
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
      if (!editingAccountId.current || accountId !== editingAccountId.current || !updateProfile({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() }, editingAccountId.current)) {
        Alert.alert('Không thể cập nhật', 'Tài khoản đã thay đổi. Vui lòng mở lại trang chỉnh sửa.');
        return;
      }
      Alert.alert('Cập nhật thành công', 'Thông tin cá nhân đã được lưu trong phiên xem thử.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Không thể cập nhật', 'Vui lòng thử lại.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (isReal && (profileLoading || profileError || !studentProfile)) return <ScreenContainer>
    <XStack style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable><Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text></XStack>
    <YStack style={styles.state}><Text style={styles.missing}>{profileLoading ? 'Đang tải hồ sơ...' : profileError ?? 'Chưa có hồ sơ sinh viên.'}</Text>{profileError ? <Pressable accessibilityRole="button" onPress={() => setReloadKey((key) => key + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable> : null}</YStack>
  </ScreenContainer>;
  if (!isReal && !profile) return <ScreenContainer><Text style={styles.missing}>Không có thông tin tài khoản.</Text></ScreenContainer>;

  return <ScreenContainer>
    <StatusBar style="dark" />
    <XStack style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
      <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
    </XStack>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" disabled={saving || isReal} onPress={pickAvatar} style={styles.avatarArea}>
        <ProfileAvatar profile={{ fullName: form.fullName, avatarUri: isReal ? validRemoteAvatarUrl(studentProfile?.avatarUrl) : form.avatarUri }} size={78} camera={!isReal} />
        {!isReal ? <Text style={styles.changeAvatar}>Đổi ảnh đại diện</Text> : null}
      </Pressable>
      <YStack style={styles.fields}>
        <FormField label="Họ và tên" value={form.fullName} onChangeText={(value) => setField('fullName', value)} placeholder="Họ và tên" autoComplete="name" autoCapitalize="words" editable={!isReal} error={errors.fullName} />
        <FormField label="Email" value={form.email} onChangeText={(value) => setField('email', value)} placeholder="Email" keyboardType="email-address" autoComplete="email" editable={!isReal} error={errors.email} />
        <FormField label="Số điện thoại" value={form.phone} onChangeText={(value) => setField('phone', value)} placeholder="Số điện thoại" keyboardType="phone-pad" autoComplete="tel" error={errors.phone} />
        <FormField label="MSSV" value={isReal ? studentProfile?.studentCode ?? '' : profile?.studentId ?? ''} onChangeText={() => {}} placeholder="Chưa cập nhật" editable={false} helperText="Không thể chỉnh sửa mã số sinh viên" />
      </YStack>
      <YStack style={styles.save}><AppButton title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} loading={saving} onPress={save} /></YStack>
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
  state: { padding: 16 }, retry: { color: colors.primary, fontFamily: typography.semibold, paddingHorizontal: 16 },
});
