export type ChatConversationId = 'manager' | 'chatbot';
export type ChatConversationType = 'MANAGER' | 'CHATBOT';
export type ChatSender = 'STUDENT' | 'PARTNER';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
}

export interface ChatConversation {
  id: ChatConversationId;
  type: ChatConversationType;
  title: string;
  messages: readonly ChatMessage[];
}

// A responder can later be backed by a verified server contract without changing ChatMessageScreen.
export interface ChatResponder {
  reply(message: string): Promise<string>;
}
