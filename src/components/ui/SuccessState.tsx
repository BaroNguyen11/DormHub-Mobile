import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { colors, radius } from '../../theme';
import { AppButton } from './AppButton';
import { ScreenContainer } from './ScreenContainer';

interface Props {
  icon: 'clock' | 'check';
  title: string;
  message: string;
  buttonTitle: string;
  onPress: () => void;
  badge?: string;
}

export function SuccessState({ icon, title, message, buttonTitle, onPress, badge }: Props) {
  const pending = icon === 'clock';
  const accent = pending ? colors.limitedText : colors.availableText;
  const background = pending ? colors.limitedBackground : colors.availableBackground;
  return (
    <ScreenContainer>
      <StatusBar hidden={false} style="dark" />
      <YStack style={styles.outer}>
        <YStack style={styles.group}>
          <YStack style={[styles.iconCircle, { backgroundColor: background }]}><Feather name={icon} size={30} color={accent} /></YStack>
          <Text color={colors.text} fontFamily="body" fontWeight="400" fontSize={20} textAlign="center" marginTop={18}>{title}</Text>
          <Text color={colors.textSecondary} fontFamily="body" fontWeight="400" fontSize={13} lineHeight="20px" textAlign="center" maxWidth={260} marginTop={10}>{message}</Text>
          {badge ? <YStack style={[styles.badge, { backgroundColor: background }]}><Text color={accent} fontFamily="body" fontWeight="700" fontSize={12}>{badge}</Text></YStack> : null}
          <YStack style={styles.button}><AppButton title={buttonTitle} onPress={onPress} /></YStack>
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  group: { width: '100%', alignItems: 'center', marginTop: -40 },
  iconCircle: { width: 76, height: 76, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 18, height: 28, justifyContent: 'center', marginTop: 20 },
  button: { width: '100%', maxWidth: 319, marginTop: 28 },
});
