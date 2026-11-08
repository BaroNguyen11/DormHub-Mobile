import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { colors, typography } from '../../theme';
import type { ChatConversationType } from '../../types/chat';

export function ChatPartnerAvatar({ type, size = 37 }: { type: ChatConversationType; size?: number }) {
  return <YStack style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, type === 'CHATBOT' && styles.botAvatar]}>
    {type === 'MANAGER' ? <TamaText style={[styles.letter, { fontSize: size * 0.4 }]}>B</TamaText> : <Feather name="cpu" size={size * 0.48} color={colors.primary} />}
  </YStack>;
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  botAvatar: { backgroundColor: colors.actionIconBackground },
  letter: { color: colors.surface, fontFamily: typography.bold },
});
