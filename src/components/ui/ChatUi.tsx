import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../theme';
import type { ChatConversationType } from '../../types/chat';

export function ChatPartnerAvatar({ type, size = 37 }: { type: ChatConversationType; size?: number }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, type === 'CHATBOT' && styles.botAvatar]}>
    {type === 'MANAGER' ? <Text style={[styles.letter, { fontSize: size * 0.4 }]}>B</Text> : <Feather name="cpu" size={size * 0.48} color={colors.primary} />}
  </View>;
}

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  botAvatar: { backgroundColor: colors.actionIconBackground },
  letter: { color: colors.surface, fontFamily: typography.bold },
});
