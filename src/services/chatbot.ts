import type { ChatResponder } from '../types/chat';

const unknownReply = 'Mình chưa có thông tin xác thực để trả lời câu hỏi này. Bạn có thể liên hệ Manager trong mục Tin nhắn.';

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function mockChatbotReply(message: string): string {
  const text = normalize(message);
  if (/(mat khau|cccd|can cuoc|thong tin nhay cam)/.test(text)) {
    return 'Bạn không cần chia sẻ mật khẩu, CCCD hoặc thông tin nhạy cảm trong cuộc trò chuyện này.';
  }
  if (/(tim phong|phong trong|dang ky phong)/.test(text)) return 'Bạn có thể mở tab Phòng để tìm phòng và xem thông tin phòng còn chỗ.';
  if (/(hoa don|thanh toan)/.test(text)) return 'Bạn có thể xem hóa đơn và lịch sử thanh toán trong tab Hóa đơn.';
  if (/(sua chua|bao hong|hong hoc)/.test(text)) return 'Từ Home, chọn Báo sửa chữa để xem hoặc tạo yêu cầu cho phòng hiện tại.';
  if (/hop dong/.test(text)) return 'Nếu đang có phòng, bạn có thể xem Hợp đồng trong tab Phòng.';
  if (/(dien nuoc|dien va nuoc)/.test(text)) return 'Nếu đang có phòng, bạn có thể xem Điện & nước trong tab Phòng.';
  return unknownReply;
}

export const mockChatResponder: ChatResponder = { reply: async (message) => mockChatbotReply(message) };
