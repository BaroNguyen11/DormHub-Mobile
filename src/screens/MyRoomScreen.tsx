import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard, UtilityMiniCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { residentRoom, roommates, residenceAmenities } from '../mocks/residence';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

const assignmentStatusLabels = { ASSIGNED: 'Đã phân phòng', CHECKED_IN: 'Đã nhận phòng', CHECKED_OUT: 'Đã trả phòng', CANCELLED: 'Đã hủy' } as const;

export function MyRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session } = useResidence();

  if (session.backendRoomId != null) {
    const assignedAt = session.backendAssignedAt?.replace('T', ' ') ?? '—';
    const checkedInAt = session.backendCheckInAt?.replace('T', ' ') ?? 'Chưa có dữ liệu';
    const status = session.backendAssignmentStatus;
    return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Phòng hiện tại" showBack={false} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.roomHeading}><View><Text style={styles.roomName}>ID phòng {session.backendRoomId}</Text><Text style={styles.roomMeta}>Mã phòng do API phân phòng trả về</Text></View><Text style={styles.badge}>{status ? assignmentStatusLabels[status] : 'Đang phân phòng'}</Text></View>
      <SurfaceCard><DetailRow label="Mã hợp đồng" value={session.backendContractId != null ? String(session.backendContractId) : '—'} /><DetailRow label="Trạng thái phân phòng" value={status ? assignmentStatusLabels[status] : '—'} /><DetailRow label="Thời điểm phân phòng" value={assignedAt} /><DetailRow label="Thời điểm nhận phòng" value={checkedInAt} last /></SurfaceCard>
      <SurfaceCard style={styles.note}><Feather name="info" size={17} color={colors.primary} /><Text style={styles.noteText}>API phân phòng hiện chưa trả số phòng, tiện nghi, điện nước hoặc danh sách bạn cùng phòng.</Text></SurfaceCard>
    </ScrollView></ScreenContainer>;
  }

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Phòng của tôi" showBack={false} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.roomHeading}><View><Text style={styles.roomName}>{residentRoom.name}</Text><Text style={styles.roomMeta}>{residentRoom.building} · Tầng {residentRoom.floor}</Text></View><Text style={styles.badge}>Đang ở</Text></View>
    <SurfaceCard><DetailRow label="Sức chứa" value={`${residentRoom.occupied} / ${residentRoom.capacity} người`} /><DetailRow label="Giá phòng" value={`${residentRoom.monthlyPrice.toLocaleString('vi-VN')}đ / tháng`} /><DetailRow label="Loại phòng" value={`${residentRoom.capacity} người / phòng`} last /></SurfaceCard>
    <SectionHeader title="Tiện nghi" /><View style={styles.amenities}>{residenceAmenities.map((item) => <View key={item.label} style={styles.amenity}><Feather name={item.icon} size={18} color={colors.textSecondary} /><Text style={styles.amenityText}>{item.label}</Text></View>)}</View>
    <SectionHeader title="Điện & nước tháng này" action="Chi tiết" onAction={() => navigation.navigate('Utilities')} /><View style={styles.utilities}><UtilityMiniCard kind="electricity" /><UtilityMiniCard kind="water" /></View>
    <SectionHeader title="Thành viên cùng phòng (3)" /><SurfaceCard>{roommates.map((member, index) => <View key={member.name} style={[styles.member, index > 0 && styles.memberBorder]}><View style={[styles.memberAvatar, index === 1 && styles.otherAvatar, index === 2 && styles.thirdAvatar]}><Text style={styles.memberInitials}>{member.initials}</Text></View><View><Text style={styles.memberName}>{member.name}</Text><Text style={styles.memberRole}>{member.role}</Text></View></View>)}</SurfaceCard>
    <AppButton title="Xem hợp đồng" variant="outline" onPress={() => navigation.navigate('Contract')} />
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18 }, roomHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, roomName: { color: colors.text, fontFamily: typography.regular, fontSize: 20 }, roomMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 4 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 }, note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 }, noteText: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, amenities: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, marginTop: -5 }, amenity: { flexDirection: 'row', gap: 10, width: '50%', alignItems: 'center' }, amenityText: { color: colors.text, fontFamily: typography.regular, fontSize: 12.5 }, utilities: { flexDirection: 'row', gap: 12 }, member: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }, memberBorder: { borderTopWidth: 0.8, borderTopColor: colors.border }, memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, otherAvatar: { backgroundColor: colors.roomMemberSecond }, thirdAvatar: { backgroundColor: colors.roomMemberThird }, memberInitials: { color: colors.surface, fontFamily: typography.semibold, fontSize: 13 }, memberName: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, memberRole: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5 },
});
