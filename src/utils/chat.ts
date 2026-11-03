import type { ChatConversation } from '../types/chat';

export function lastChatMessage(conversation: ChatConversation) {
  return conversation.messages[conversation.messages.length - 1];
}

export function chatHourLabel(createdAt: string): string {
  return `${new Date(createdAt).getHours()} giờ`;
}

export function chatClockLabel(createdAt: string): string {
  const date = new Date(createdAt);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
