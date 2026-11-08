import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ComponentRef } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, radius, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import { validateOtp } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'OtpConfirm'>;
const maskEmail = (email: string) => { const [name, domain] = email.split('@'); return `${name.slice(0, 2)}*****${name.slice(-1)}@${domain}`; };

export function OtpConfirmScreen({ navigation, route }: Props) {
  const { requestPasswordReset } = useMockAccount();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>();
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);
  const resendingRef = useRef(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  useEffect(() => { if (seconds <= 0) return; const id = setTimeout(() => setSeconds(seconds - 1), 1000); return () => clearTimeout(id); }, [seconds]);
  const submit = () => {
    const next = validateOtp(otp);
    if (next) { setError(next); return; }
    navigation.navigate('ResetPassword', { email: route.params.email, otp });
  };
  const resend = async () => {
    if (resendingRef.current || seconds > 0) return;
    resendingRef.current = true;
    setResending(true);
    setError(undefined);
    try {
      await requestPasswordReset(route.params.email);
      setOtp('');
      setSeconds(60);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Không gửi lại được mã OTP.');
    } finally {
      resendingRef.current = false;
      setResending(false);
    }
  };

  return <AuthLayout title="Nhập mã OTP" subtitle="Nếu email có trong hệ thống, mã đặt lại mật khẩu sẽ được gửi đến địa chỉ này. Mã sẽ được kiểm tra khi bạn đặt lại mật khẩu." onBack={() => navigation.goBack()}>
    <Text style={styles.email}>{maskEmail(route.params.email)}</Text>
    <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()} accessibilityLabel="Nhập mã OTP"><TextInput ref={inputRef} value={otp} onChangeText={(value) => { setOtp(value.replace(/\D/g, '').slice(0, 6)); setError(undefined); }} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} style={styles.hiddenInput} />{Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.box, index === otp.length && styles.activeBox]}><Text style={styles.digit}>{otp[index] ?? ''}</Text></View>)}</Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <XStack style={styles.resend}><Text style={styles.muted}>Không nhận được mã? </Text><Pressable disabled={seconds > 0 || resending} onPress={() => void resend()}><Text style={[styles.resendLink, (seconds > 0 || resending) && styles.muted]}>{resending ? 'Đang gửi...' : seconds > 0 ? `Gửi lại sau ${seconds}s` : 'Gửi lại mã'}</Text></Pressable></XStack>
    <YStack style={styles.button}><AppButton title="Tiếp tục đặt lại mật khẩu" onPress={submit} /></YStack>
  </AuthLayout>;
}
const styles = StyleSheet.create({ email: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginTop: -13, marginBottom: 26 }, boxes: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 }, box: { flex: 1, height: 49, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }, activeBox: { borderColor: colors.primary }, digit: { color: colors.text, fontFamily: typography.bold, fontSize: 19 }, error: { color: colors.error, fontSize: 12, marginTop: 8 }, resend: { flexDirection: 'row', justifyContent: 'center', marginTop: 23 }, muted: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, resendLink: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 }, button: { marginTop: 29 } });
