import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { colors } from '../../theme';
import { ScreenContainer } from './ScreenContainer';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  hideBack?: boolean;
}

export function AuthLayout({ title, subtitle, onBack, children, hideBack = false }: Props) {
  return (
    <ScreenContainer>
      <StatusBar hidden={false} style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <YStack style={styles.backArea}>
          {!hideBack && (
            <Pressable accessibilityLabel="Quay lại" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </Pressable>
          )}
        </YStack>
        <Text color={colors.text} fontFamily="body" fontWeight="400" fontSize={24} lineHeight="30px" marginTop={8}>{title}</Text>
        {subtitle ? <Text color={colors.textSecondary} fontFamily="body" fontWeight="400" fontSize={13} lineHeight="20px" marginTop={10}>{subtitle}</Text> : null}
        <YStack style={styles.body}>{children}</YStack>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  backArea: { height: 48, justifyContent: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  body: { marginTop: 20 },
});
