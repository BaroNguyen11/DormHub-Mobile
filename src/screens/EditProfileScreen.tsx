import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { TextArea, XStack, YStack } from 'tamagui';
import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getStudentProfile, updateStudentProfile } from '../api/studentProfile';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';
import type { StudentGender, StudentProfile, StudentProfileUpdate } from '../types/studentProfile';
import { validateStudentPhone } from '../utils/validation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;
type ProfileForm = { phone: string; dateOfBirth: string; gender: StudentGender | null; address: string; cic: string };
export function EditProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({ phone: '', dateOfBirth: '', gender: null, address: '', cic: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldError, setFieldError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError(undefined); getStudentProfile().then(({ data }) => { if (!active) return; setProfile(data); setForm({ phone: data.phone ?? '', dateOfBirth: data.dateOfBirth ?? '', gender: data.gender, address: data.address ?? '', cic: data.cic ?? '' }); }).catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được hồ sơ sinh viên.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [reload]);
  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => { setForm((previous) => ({ ...previous, [key]: value })); setFieldError(undefined); setError(undefined); };
  const save = async () => {
    if (!profile || saving) return;
    if (!form.gender) { setFieldError('Vui lòng chọn giới tính để hoàn thiện hồ sơ.'); return; }
    const phone = form.phone.replace(/[\s.-]/g, '');
    const phoneError = phone ? validateStudentPhone(phone) : undefined;
    if (phoneError) { setFieldError(phoneError); return; }
    if (form.dateOfBirth && (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) || Number.isNaN(Date.parse(form.dateOfBirth)) || new Date(form.dateOfBirth) >= new Date(new Date().toDateString()))) { setFieldError('Ngày sinh phải đúng định dạng YYYY-MM-DD và nhỏ hơn hôm nay.'); return; }
    if (form.address.length > 255) { setFieldError('Địa chỉ tối đa 255 ký tự.'); return; }
    if (form.cic && !/^\d{12}$/.test(form.cic)) { setFieldError('CCCD phải gồm đúng 12 chữ số.'); return; }
    const update: StudentProfileUpdate = {};
    if (phone && phone !== (profile.phone ?? '')) update.phone = phone;
    if (form.dateOfBirth && form.dateOfBirth !== (profile.dateOfBirth ?? '')) update.dateOfBirth = form.dateOfBirth;
    if (form.gender !== profile.gender) update.gender = form.gender;
    if (form.address !== (profile.address ?? '')) update.address = form.address;
    if (form.cic && form.cic !== (profile.cic ?? '')) update.cic = form.cic;
    if (Object.keys(update).length === 0) { navigation.goBack(); return; }
    setSaving(true); setError(undefined);
    try { await updateStudentProfile(update); navigation.goBack(); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không thể cập nhật hồ sơ.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer><XStack style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable><Text style={styles.headerTitle}>Thông tin sinh viên</Text></XStack>
    {loading ? <Text style={styles.state}>Đang tải hồ sơ...</Text> : error && !profile ? <YStack style={styles.state}><Text style={styles.error}>{error}</Text><Pressable onPress={() => setReload((value) => value + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable></YStack> : profile ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <YStack style={styles.fields}><FormField label="Họ và tên" value={profile.fullName ?? ''} onChangeText={() => undefined} editable={false} placeholder="Họ và tên" /><FormField label="Email" value={profile.email ?? ''} onChangeText={() => undefined} editable={false} placeholder="Email" /><FormField label="Mã sinh viên" value={profile.studentCode ?? ''} onChangeText={() => undefined} editable={false} placeholder="Mã sinh viên" /><FormField label="Số điện thoại" value={form.phone} onChangeText={(value) => setField('phone', value)} keyboardType="phone-pad" placeholder="Số điện thoại" /><FormField label="Ngày sinh (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(value) => setField('dateOfBirth', value)} placeholder="2004-05-20" />
        <YStack><Text style={styles.label}>Giới tính</Text><XStack style={styles.gender}>{(['MALE', 'FEMALE'] as const).map((gender) => <Pressable key={gender} disabled={!!profile.gender} onPress={() => setField('gender', gender)} style={[styles.genderOption, form.gender === gender && styles.genderSelected]}><Text style={[styles.genderText, form.gender === gender && styles.genderTextSelected]}>{gender === 'MALE' ? 'Nam' : 'Nữ'}</Text></Pressable>)}</XStack>{profile.gender ? <Text style={styles.hint}>Giới tính đã xác nhận không thể thay đổi.</Text> : null}</YStack>
        <YStack><Text style={styles.label}>Địa chỉ</Text><TextArea value={form.address} onChangeText={(value) => setField('address', value)} placeholder="Địa chỉ thường trú" style={styles.textArea} /></YStack>
        <FormField label="CCCD (12 chữ số)" value={form.cic} onChangeText={(value) => setField('cic', value.replace(/\D/g, '').slice(0, 12))} keyboardType="number-pad" placeholder="Nhập số CCCD" />
      </YStack>
      {fieldError ? <Text style={styles.error}>{fieldError}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<AppButton title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} loading={saving} disabled={saving} onPress={() => void save()} />
    </ScrollView> : <Text style={styles.state}>Chưa có hồ sơ sinh viên.</Text>}
  </ScreenContainer>;
}
const styles = StyleSheet.create({ header: { height: 52, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }, back: { width: 28, height: 40, justifyContent: 'center' }, headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 }, content: { padding: 16, gap: 18 }, fields: { gap: 16 }, label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 7 }, gender: { gap: 10 }, genderOption: { minWidth: 90, height: 42, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, genderSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, genderText: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 13 }, genderTextSelected: { color: colors.surface }, hint: { color: colors.textSecondary, fontSize: 11, marginTop: 6 }, textArea: { minHeight: 80, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontFamily: typography.regular, fontSize: 13, color: colors.text }, state: { padding: 18, color: colors.textSecondary }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 }, retry: { color: colors.primary, fontFamily: typography.semibold, marginTop: 8 } });
