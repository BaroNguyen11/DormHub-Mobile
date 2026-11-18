import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const { sessionError } = useAuth();
  return (
    <ScreenContainer>
      <StatusBar hidden={false} style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <YStack style={styles.main}>
          <Image source={require('../../assets/figma/welcome-room.png')} contentFit="cover" style={styles.illustration} />
          <YStack style={styles.copy}>
            <Text color={colors.text} fontFamily="body" fontWeight="400" fontSize={typography.welcomeTitle} lineHeight="29px" textAlign="center">Ký túc xá của bạn,{'\n'}gọn trong một ứng dụng</Text>
            <Text color={colors.textSecondary} fontFamily="body" fontWeight="400" fontSize={12} lineHeight="20px" textAlign="center" marginTop={8}>Tìm phòng, theo dõi hóa đơn và gửi yêu cầu sửa chữa — tất cả tại một nơi.</Text>
          </YStack>
        </YStack>
        <YStack style={styles.actions}>
          {sessionError ? <Text color={colors.error} fontFamily="body" fontSize={12} textAlign="center">{sessionError}</Text> : null}
          <AppButton title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
          <AppButton title="Tài khoản đã được cấp · Kích hoạt email" variant="outline" onPress={() => navigation.navigate('ActivateAccount')} />
          <AppButton title="Khám phá phòng" variant="text" onPress={() => navigation.navigate('Explore')} />
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: spacing.welcomeTop, paddingHorizontal: 16, paddingBottom: 28 },
  main: { width: '100%', maxWidth: 303 },
  illustration: { width: '100%', height: 220, borderRadius: radius.card },
  copy: { marginTop: 16, height: 107, alignItems: 'center' },
  actions: { width: '100%', maxWidth: 303, gap: spacing.buttonGap, marginTop: spacing.welcomeSectionGap },
});
