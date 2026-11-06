import type { ChatConversation } from '../types/chat';

// Seeded from the two PDF previews. Messages remain local demo data.
export const studentChatConversations: readonly ChatConversation[] = [
  {
    id: 'manager', type: 'MANAGER', title: 'Manager',
    messages: [
      { id: 'manager-1', sender: 'PARTNER', text: 'Lên sửa phòng cho bố', createdAt: '2026-09-11T19:00:00' },
      { id: 'manager-2', sender: 'PARTNER', text: 'Lên sửa phòng cho bố', createdAt: '2026-09-11T19:01:00' },
      { id: 'manager-3', sender: 'STUDENT', text: 'Lên sửa phòng cho bố', createdAt: '2026-09-11T19:02:00' },
    ],
  },
  {
    id: 'chatbot', type: 'CHATBOT', title: 'Chatbot',
    messages: [
      { id: 'chatbot-1', sender: 'STUDENT', text: 'mèo méo meo mèo meo', createdAt: '2026-09-11T19:00:00' },
    ],
  },
];
