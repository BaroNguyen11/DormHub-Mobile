import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StudentRoomDto } from '../api/studentRooms';
import { getStudentRoom } from '../api/studentRooms';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { formatRoomPrice, roomAvailabilityLabel, roomTypeLabels } from '../components/ui/StudentRoomCard';
import { colors, radius, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'RoomDetail'>;
export function RoomDetailScreen({ navigation }: Props) {
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Chi tiết phòng" onBack={() => navigation.goBack()} />
    <View style={styles.center}><Text style={styles.message}>Đăng nhập bằng tài khoản sinh viên để xem thông tin phòng.</Text>
      <AppButton title="Đăng nhập" onPress={() => navigation.navigate('Login')} /></View>
  </ScreenContainer>;
}

interface RoomDetailViewProps {
  roomId: string;
  canApplyByState: boolean;
  onBack: () => void;
  onApply: () => void;
  onStatus: () => void;
}

export function RoomDetailView({ roomId, canApplyByState, onBack, onApply, onStatus }: RoomDetailViewProps) {
  const parsedId = /^\d+$/.test(roomId) ? Number(roomId) : null;
  const validId = parsedId != null && Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const [room, setRoom] = useState<StudentRoomDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setRoom(null);
    setError(false);
    setLoading(true);
    if (validId == null) { setLoading(false); setError(true); return () => { active = false; }; }
    void getStudentRoom(validId).then((result) => {
      if (active) setRoom(result.roomId === validId ? result : null);
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [validId, reloadKey]));

  const canCheckRegistration = room?.availableForApplication === true && canApplyByState;
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Chi tiết phòng" onBack={onBack} />
    {loading ? <View style={styles.center}><Text style={styles.message}>Đang tải thông tin phòng...</Text></View> :
      error || !room ? <View style={styles.center}><Text style={styles.message}>Không thể tải thông tin phòng. Vui lòng thử lại.</Text>
        <AppButton title="Thử lại" variant="outline" onPress={() => setReloadKey((value) => value + 1)} /></View> :
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholder}><Feather name="home" size={42} color={colors.inactiveTab} /></View>
          <Text style={styles.title}>Phòng {room.roomNumber}</Text>
          <Text style={styles.building}>{room.buildingName} · {room.buildingCode}</Text>
          {room.buildingAddress ? <Text style={styles.message}>{room.buildingAddress}</Text> : null}
          <SurfaceCard>
            <DetailRow label="Loại phòng" value={roomTypeLabels[room.roomType]} />
            <DetailRow label="Tầng" value={String(room.floor)} />
            <DetailRow label="Sức chứa" value={`${room.capacity} người`} />
            <DetailRow label="Đang ở" value={`${room.currentOccupancy} người`} />
            <DetailRow label="Chỗ còn nhận đơn" value={`${room.remainingSlots} chỗ`} />
            <DetailRow label="Giá mỗi tháng" value={formatRoomPrice(room.pricePerMonth)} />
            <DetailRow label="Tình trạng" value={roomAvailabilityLabel(room)} last />
          </SurfaceCard>
          {room.description ? <SurfaceCard><Text style={styles.description}>{room.description}</Text></SurfaceCard> : null}
          {!room.availableForApplication ? <Text style={styles.message}>Phòng này hiện không nhận đăng ký.</Text> :
            !room.eligibleForStudent ? <Text style={styles.message}>Bạn chưa thể đăng ký phòng này. Vui lòng kiểm tra hồ sơ hoặc đơn đăng ký hiện tại.</Text> : null}
          {canCheckRegistration ? <AppButton title={room.eligibleForStudent ? 'Đăng ký phòng' : 'Xem điều kiện đăng ký'} onPress={onApply} /> :
            !canApplyByState ? <AppButton title="Xem trạng thái đăng ký" variant="outline" onPress={onStatus} /> : null}
        </ScrollView>}
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  placeholder: { minHeight: 156, borderRadius: radius.card, backgroundColor: colors.fullBackground, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 21 },
  building: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 14 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  description: { color: colors.text, fontFamily: typography.regular, fontSize: 13, lineHeight: 20 },
});
