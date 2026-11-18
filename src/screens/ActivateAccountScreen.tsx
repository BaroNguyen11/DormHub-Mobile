import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { ApiError } from '../api/httpClient';
import { resendActivationOtp, verifyActivationOtp } from '../api/auth';
import { AppButton } from '../components/ui/AppButton';
import { AuthLayout } from '../components/ui/AuthLayout';
import { FormField } from '../components/ui/FormField';
import { colors, radius, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import { validateEmail, validateOtp } from '../utils/validation';

type Props = NativeStackScreenProps<GuestStackParamList, 'ActivateAccount'>;
type Step = 'email' | 'otp';

export function ActivateAccountScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>();
  const otpInput = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOtp = async (isResend = false) => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    if (isResend && (countdown > 0 || resending)) return;
    setError(undefined);
    if (isResend) setResending(true);
    else setBusy(true);
    try {
      await resendActivationOtp(email);
      setStep('otp');
      setOtp('');
      setCountdown(60);
      setTimeout(() => otpInput.current?.focus(), 150);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Không gửi được mã OTP. Vui lòng thử lại.');
    } finally {
      setBusy(false);
      setResending(false);
    }
  };

  const verifyOtp = async () => {
    const otpError = validateOtp(otp);
    if (otpError) {
      setError(otpError);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await verifyActivationOtp(email, otp);
      navigation.replace('Login', {
        status: 'verified',
        message: 'Email đã được xác thực. Bạn có thể đăng nhập.',
      });
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Không xác thực được mã OTP. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title={step === 'email' ? 'Kích hoạt tài khoản' : 'Nhập mã xác thực OTP'}
      subtitle={step === 'email'
        ? 'Nhập email trường cấp để nhận mã kích hoạt tài khoản.'
        : `Mã OTP gồm 6 chữ số đã được gửi tới ${email.trim()}.`}
      onBack={() => step === 'otp' ? setStep('email') : navigation.goBack()}
    >
      <View style={styles.icon}><Feather name="mail" size={22} color={colors.primary} /></View>
      {step === 'email' ? (
        <YStack style={styles.form}>
          <FormField
            label="Email trường cấp"
            placeholder="name@student.iuh.edu.vn"
            value={email}
            onChangeText={(value) => { setEmail(value); setError(undefined); }}
            error={error && validateEmail(email) ? error : undefined}
            keyboardType="email-address"
            autoComplete="email"
          />
          {error && !validateEmail(email) ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title={busy ? 'Đang gửi OTP…' : 'Gửi mã OTP'} onPress={() => void sendOtp()} loading={busy} disabled={!email.trim()} />
        </YStack>
      ) : (
        <YStack style={styles.form}>
          <XStack style={styles.emailRow}>
            <Text style={styles.emailText} numberOfLines={1}>Email: <Text style={styles.strong}>{email.trim()}</Text></Text>
            <Pressable accessibilityRole="button" onPress={() => { setStep('email'); setOtp(''); setError(undefined); }}>
              <Text style={styles.link}>Đổi email</Text>
            </Pressable>
          </XStack>
          <View>
            <Text style={styles.label}>Mã OTP (6 chữ số)</Text>
            <TextInput
              ref={otpInput}
              accessibilityLabel="Mã OTP gồm 6 chữ số"
              value={otp}
              onChangeText={(value) => { setOtp(value.replace(/\D/g, '').slice(0, 6)); setError(undefined); }}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Nhập mã gồm 6 chữ số"
              placeholderTextColor={colors.placeholder}
              style={styles.otpInput}
            />
          </View>
          <AppButton title={busy ? 'Đang xác thực…' : 'Xác thực email'} onPress={() => void verifyOtp()} loading={busy} disabled={otp.length !== 6} />
          <XStack style={styles.resendRow}>
            <Text style={styles.muted}>Chưa nhận được mã? </Text>
            <Pressable accessibilityRole="button" disabled={countdown > 0 || resending} onPress={() => void sendOtp(true)}>
              <Text style={[styles.link, (countdown > 0 || resending) && styles.disabledLink]}>
                {resending ? 'Đang gửi…' : countdown > 0 ? `Gửi lại OTP (${countdown}s)` : 'Gửi lại OTP'}
              </Text>
            </Pressable>
          </XStack>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </YStack>
      )}
      <Pressable style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.muted}>Đã kích hoạt? </Text><Text style={styles.link}>Quay lại đăng nhập</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  icon: { width: 48, height: 48, borderRadius: radius.button, backgroundColor: colors.actionIconBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  form: { gap: 18 },
  label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 7 },
  otpInput: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.text, fontFamily: typography.bold, fontSize: 18, letterSpacing: 6, textAlign: 'center' },
  emailRow: { minHeight: 46, backgroundColor: colors.limitedBackground, borderRadius: radius.button, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  emailText: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5 },
  strong: { color: colors.text, fontFamily: typography.bold },
  link: { color: colors.primary, fontFamily: typography.semibold, fontSize: 12.5 },
  resendRow: { justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  muted: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 },
  disabledLink: { color: colors.inactiveTab },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 },
  loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
