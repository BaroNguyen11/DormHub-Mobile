import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { studentChatConversations } from '../mocks/chats';
import { mockChatResponder } from '../services/chatbot';
import type { DevPreviewAccountId } from '../types/auth';
import type { ChatConversation, ChatConversationId, ChatMessage, ChatResponder } from '../types/chat';
import { useMockAccount } from './MockAccountContext';

interface ChatContextValue {
  conversations: readonly ChatConversation[];
  sendMessage: (conversationId: ChatConversationId, text: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function cloneConversations(items: readonly ChatConversation[]): readonly ChatConversation[] {
  return items.map((item) => ({ ...item, messages: item.messages.map((message) => ({ ...message })) }));
}

export function ChatProvider({ children, responder = mockChatResponder }: PropsWithChildren<{ responder?: ChatResponder }>) {
  const { accountId } = useMockAccount();
  const [byAccount, setByAccount] = useState<Record<DevPreviewAccountId, readonly ChatConversation[]>>({
    student: cloneConversations(studentChatConversations),
    newstudent: studentChatConversations.map((item) => ({ ...item, messages: [] })),
    rejectedstudent: studentChatConversations.map((item) => ({ ...item, messages: [] })),
  });
  const sequence = useRef(0);
  const conversations = accountId ? byAccount[accountId] : [];

  const append = useCallback((owner: DevPreviewAccountId, conversationId: ChatConversationId, message: ChatMessage) => {
    setByAccount((previous) => ({
      ...previous,
      [owner]: previous[owner].map((conversation) => conversation.id === conversationId
        ? { ...conversation, messages: [...conversation.messages, message] }
        : conversation),
    }));
  }, []);

  const sendMessage = useCallback(async (conversationId: ChatConversationId, rawText: string): Promise<boolean> => {
    const text = rawText.trim();
    if (!accountId || !text) return false;
    const conversation = byAccount[accountId].find((item) => item.id === conversationId);
    if (!conversation) return false;
    const now = new Date().toISOString();
    append(accountId, conversationId, { id: `chat-${Date.now()}-${sequence.current++}`, sender: 'STUDENT', text, createdAt: now });
    if (conversation.type === 'CHATBOT') {
      let answer: string;
      try { answer = await responder.reply(text); }
      catch { answer = 'Chatbot tạm thời chưa thể trả lời. Vui lòng thử lại sau.'; }
      append(accountId, conversationId, { id: `chat-${Date.now()}-${sequence.current++}`, sender: 'PARTNER', text: answer, createdAt: new Date().toISOString() });
    }
    return true;
  }, [accountId, append, byAccount, responder]);

  return <ChatContext.Provider value={{ conversations, sendMessage }}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const value = useContext(ChatContext);
  if (!value) throw new Error('ChatProvider is missing');
  return value;
}
