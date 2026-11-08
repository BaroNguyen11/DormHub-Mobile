import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { colors, radius, typography } from '../theme';
export function SplashScreen() {
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
