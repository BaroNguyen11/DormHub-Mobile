import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { mockSession } from '../mocks/session';
import { devPreviewEnabled } from '../config/devPreview';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, radius, typography } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { isAuthenticated, isSessionInitializing } = useMockAccount();
  useEffect(() => {
    if (isSessionInitializing) return;
    const timer = setTimeout(() => {
      if (isAuthenticated || (devPreviewEnabled && mockSession.kind === 'student')) navigation.replace('Student');
      else navigation.replace('Guest');
    }, 1100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isSessionInitializing, navigation]);

  return (
    <YStack style={styles.screen}>
      <StatusBar hidden />
      <YStack style={styles.brand}>
        <YStack style={styles.iconBox}>
          <Image source={require('../../assets/figma/splash-home.svg')} style={styles.icon} />
        </YStack>
        <Text color={colors.surface} fontFamily="body" fontWeight="400" fontSize={typography.splashTitle} marginTop={14}>DormHub</Text>
        <Text color="rgba(255,255,255,0.75)" fontFamily="body" fontWeight="400" fontSize={13} marginTop={10} textAlign="center">Smart living, simpler management.</Text>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brand: { width: 240, alignItems: 'center' },
  iconBox: { width: 72, height: 72, borderRadius: radius.splashIcon, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  icon: { width: 34, height: 34 },
});
