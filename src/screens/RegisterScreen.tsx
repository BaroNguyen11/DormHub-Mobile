import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { colors, radius, typography } from '../theme';
import type { RegisterForm } from '../types/auth';
import type { GuestStackParamList } from '../types/navigation';
import type { FieldErrors } from '../types/validation';
import { validateRegister } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Register'>;
const initialForm: RegisterForm = { fullName: '', email: '', phone: '', identityNumber: '', identityFrontUri: null, identityBackUri: null, username: '', password: '', confirmPassword: '', acceptedTerms: true };

export function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors<keyof RegisterForm>>({});
  const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => { setForm((previous) => ({ ...previous, [key]: value })); setErrors((previous) => ({ ...previous, [key]: undefined })); };
  const pickIdentity = async (key: 'identityFrontUri' | 'identityBackUri') => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setField(key, result.assets[0].uri);
  };
  const submit = () => { const next = validateRegister(form); setErrors(next); if (Object.keys(next).length === 0) navigation.navigate('RegisterSuccess'); };
  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Đăng ký tài khoản để bắt đầu trải nghiệm DormHub. Tài khoản sẽ được Manager xác nhận sau khi đăng ký." onBack={() => navigation.goBack()}>
      <YStack style={styles.fields}>
        <FormField label="Họ và tên" placeholder="Nguyễn Văn A" value={form.fullName} onChangeText={(value) => setField('fullName', value)} error={errors.fullName} autoCapitalize="words" autoComplete="name" />
        <FormField label="Email" placeholder="ban@email.com" value={form.email} onChangeText={(value) => setField('email', value)} error={errors.email} keyboardType="email-address" autoComplete="email" />
        <FormField label="Số điện thoại" placeholder="0901 234 567" value={form.phone} onChangeText={(value) => setField('phone', value)} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" />
        <FormField label="CCCD" placeholder="045205231112" value={form.identityNumber} onChangeText={(value) => setField('identityNumber', value)} error={errors.identityNumber} keyboardType="number-pad" />
        <XStack style={styles.images}>{(['identityFrontUri', 'identityBackUri'] as const).map((key) => <YStack key={key} style={styles.imageCell}><Pressable style={styles.imageTile} onPress={() => pickIdentity(key)} accessibilityLabel={key === 'identityFrontUri' ? 'Chọn ảnh CCCD mặt trước' : 'Chọn ảnh CCCD mặt sau'}>{form[key] ? <Image source={{ uri: form[key] }} style={styles.preview} contentFit="cover" /> : <><Feather name="camera" size={22} color={colors.placeholder} /><Text style={styles.imageText}>{key === 'identityFrontUri' ? 'CCCD mặt trước' : 'CCCD mặt sau'}</Text></>}</Pressable>{errors[key] ? <Text style={styles.error}>{errors[key]}</Text> : null}</YStack>)}</XStack>
        <FormField label="Username" placeholder="23647241" value={form.username} onChangeText={(value) => setField('username', value)} error={errors.username} autoComplete="username" />
        <FormField label="Mật khẩu" placeholder="Tối thiểu 8 ký tự" value={form.password} onChangeText={(value) => setField('password', value)} error={errors.password} secure autoComplete="new-password" />
        <FormField label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChangeText={(value) => setField('confirmPassword', value)} error={errors.confirmPassword} secure autoComplete="new-password" />
      </YStack>
      <Pressable style={styles.terms} onPress={() => setField('acceptedTerms', !form.acceptedTerms)}><View style={[styles.checkbox, form.acceptedTerms && styles.checked]}>{form.acceptedTerms ? <Feather name="check" size={13} color={colors.surface} /> : null}</View><Text style={styles.termsText}>Tôi đồng ý với <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và <Text style={styles.termsLink}>Chính sách bảo mật</Text></Text></Pressable>
      {errors.acceptedTerms ? <Text style={styles.error}>{errors.acceptedTerms}</Text> : null}
      <YStack style={styles.submit}><AppButton title="Đăng ký" onPress={submit} /></YStack>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 15 }, images: { flexDirection: 'row', gap: 12 }, imageCell: { flex: 1 }, imageTile: { height: 84, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, preview: { width: '100%', height: '100%' }, imageText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 6 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 11.5, marginTop: 4 }, terms: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 17 }, checkbox: { width: 17, height: 17, borderRadius: 3, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.primary }, termsText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, flex: 1 }, termsLink: { color: colors.primary }, submit: { marginTop: 20 },
});
