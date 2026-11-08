import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText, XStack, YStack } from 'tamagui';

import { ChatPartnerAvatar } from '../components/ui/ChatUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChats } from '../context/ChatContext';
import { colors, typography } from '../theme';
import type { ChatConversation } from '../types/chat';
import type { ChatStackParamList } from '../types/navigation';
import { chatHourLabel, lastChatMessage } from '../utils/chat';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatList'>;

export function ChatListScreen({ navigation }: Props) {
  const { conversations } = useChats();
  const ordered = [...conversations].sort((a, b) => {
    const aTime = lastChatMessage(a)?.createdAt ?? '';
    const bTime = lastChatMessage(b)?.createdAt ?? '';
    return bTime.localeCompare(aTime);
  });
  const renderConversation = ({ item }: { item: ChatConversation }) => {
    const recent = lastChatMessage(item);
    return <Pressable accessibilityRole="button" onPress={() => navigation.navigate('ChatMessage', { conversationId: item.id })} style={styles.row}>
      <ChatPartnerAvatar type={item.type} />
      <YStack style={styles.copy}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {recent ? `${recent.sender === 'STUDENT' ? 'Bạn: ' : ''}${recent.text} · ${chatHourLabel(recent.createdAt)}` : 'Chưa có tin nhắn'}
        </Text>
      </YStack>
    </Pressable>;
  };

  return <ScreenContainer>
    <StatusBar style="dark" />
    <XStack style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.getParent()?.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
      <Text style={styles.headerTitle}>Tin nhắn</Text>
    </XStack>
    <FlatList data={ordered} keyExtractor={(item) => item.id} renderItem={renderConversation} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={<YStack style={styles.empty}><TamaText style={styles.emptyTitle}>Chưa có cuộc trò chuyện</TamaText><TamaText style={styles.emptyBody}>Tin nhắn mới sẽ xuất hiện tại đây.</TamaText></YStack>} />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  list: { paddingTop: 16, paddingBottom: 24 },
  row: { minHeight: 59, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  name: { color: colors.text, fontFamily: typography.bold, fontSize: 14 },
  preview: { color: colors.text, fontFamily: typography.regular, fontSize: 12.5, marginTop: 3 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 16 },
  emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  emptyBody: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 8, textAlign: 'center' },
});
