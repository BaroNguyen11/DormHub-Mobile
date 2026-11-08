import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StudentRoomDto, StudentRoomStatus, StudentRoomType } from '../../api/studentRooms';
import { colors, radius, typography } from '../../theme';

export const roomTypeLabels: Record<StudentRoomType, string> = {
  SINGLE: 'Phòng đơn', DOUBLE: 'Phòng đôi', QUAD: 'Phòng 4 người',
  SIX_BED: 'Phòng 6 người', EIGHT_BED: 'Phòng 8 người',
};
export const roomStatusLabels: Record<StudentRoomStatus, string> = {
  AVAILABLE: 'Đang nhận đăng ký', OCCUPIED: 'Đã đủ người',
  MAINTENANCE: 'Đang bảo trì', RESERVED: 'Đã được giữ chỗ',
};
export const formatRoomPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ/tháng`;
export const roomAvailabilityLabel = (room: StudentRoomDto) =>
  room.status === 'AVAILABLE' && !room.availableForApplication ? 'Đã hết chỗ nhận đơn' : roomStatusLabels[room.status];

export function StudentRoomCard({ room, onPress }: { room: StudentRoomDto; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
    <View style={styles.placeholder}><Feather name="home" size={28} color={colors.inactiveTab} /></View>
    <View style={styles.body}>
      <View style={styles.heading}><Text style={styles.title}>Phòng {room.roomNumber}</Text><Feather name="chevron-right" size={18} color={colors.inactiveTab} /></View>
      <Text style={styles.detail}>{room.buildingName} · {roomTypeLabels[room.roomType]}</Text>
      <Text style={styles.detail}>Đang ở {room.currentOccupancy}/{room.capacity} · Còn {room.remainingSlots} chỗ</Text>
      <Text style={styles.price}>{formatRoomPrice(room.pricePerMonth)}</Text>
      <Text style={[styles.availability, room.eligibleForStudent && styles.eligible]}>{room.eligibleForStudent ? 'Có thể đăng ký' : room.availableForApplication ? 'Chưa thể đăng ký' : roomAvailabilityLabel(room)}</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.card, padding: 12, gap: 12 },
  placeholder: { width: 78, minHeight: 88, borderRadius: radius.button, backgroundColor: colors.fullBackground, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 5 }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  detail: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 },
  price: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 },
  availability: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 12 },
  eligible: { color: colors.availableText },
});
