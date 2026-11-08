import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Input, Text as TamaText, XStack, YStack } from 'tamagui';

import { ChatPartnerAvatar } from '../components/ui/ChatUi';
import { ProfileAvatar } from '../components/ui/ProfileUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useChats } from '../context/ChatContext';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, radius, typography } from '../theme';
import type { ChatMessage } from '../types/chat';
import type { ChatStackParamList } from '../types/navigation';
import { chatClockLabel } from '../utils/chat';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatMessage'>;

export function ChatMessageScreen({ navigation, route }: Props) {
  const { conversations, sendMessage } = useChats();
  const { profile } = useMockAccount();
  const conversation = conversations.find((item) => item.id === route.params.conversationId);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const submit = () => {
    const text = draft.trim();
    if (!text || !conversation) return;
    setDraft('');
    void sendMessage(conversation.id, text);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.sender === 'STUDENT';
    return <XStack style={[styles.messageRow, mine && styles.myMessageRow]}>
      {!mine && conversation ? <ChatPartnerAvatar type={conversation.type} /> : null}
      <YStack style={styles.bubble}><TamaText style={styles.messageText}>{item.text}</TamaText></YStack>
      {mine && profile ? <ProfileAvatar profile={profile} size={37} /> : null}
    </XStack>;
  };

  return <ScreenContainer backgroundColor={colors.surface}>
    <StatusBar style="dark" />
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <XStack style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={24} color={colors.text} /></Pressable>
        {conversation ? <ChatPartnerAvatar type={conversation.type} /> : null}
        <Text style={styles.headerTitle}>{conversation?.title ?? 'Tin nhắn'}</Text>
      </XStack>
      {conversation ? <>
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={conversation.messages.length ? <Text style={styles.timeLabel}>{chatClockLabel(conversation.messages[0].createdAt)}</Text> : undefined}
        />
        <XStack style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Đính kèm" onPress={() => Alert.alert('Chưa hỗ trợ', 'Đính kèm chưa có trong bản xem thử.')} style={styles.addButton}><Feather name="plus" size={22} color={colors.surface} /></Pressable>
          <Input size={false} borderWidth={0} accessibilityLabel="Nội dung tin nhắn" value={draft} onChangeText={setDraft} onSubmitEditing={submit} returnKeyType="send" placeholder="Aa" placeholderTextColor="inactiveTab" style={styles.input} />
          <Pressable accessibilityRole="button" accessibilityLabel="Gửi tin nhắn" accessibilityState={{ disabled: !draft.trim() }} disabled={!draft.trim()} onPress={submit} style={styles.sendButton}><Feather name="send" size={25} color={draft.trim() ? colors.primary : colors.inactiveTab} /></Pressable>
        </XStack>
      </> : <View style={styles.missing}><Text style={styles.missingText}>Không tìm thấy cuộc trò chuyện.</Text></View>}
    </KeyboardAvoidingView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 17 },
  messages: { paddingHorizontal: 16, paddingBottom: 18 },
  timeLabel: { color: colors.text, fontFamily: typography.regular, fontSize: 12, textAlign: 'center', marginTop: 18, marginBottom: 22 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 12 },
  myMessageRow: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '72%', backgroundColor: colors.chatBubble, borderRadius: radius.button, paddingHorizontal: 10, paddingVertical: 9 },
  messageText: { color: colors.text, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 },
  composer: { minHeight: 68, backgroundColor: colors.chatComposer, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 },
  addButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, height: 46, borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: 14, color: colors.text, fontFamily: typography.regular, fontSize: 14 },
  sendButton: { width: 31, height: 46, alignItems: 'center', justifyContent: 'center' },
  missing: { padding: 16 },
  missingText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
});
