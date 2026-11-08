import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StudentRoomDto } from '../api/studentRooms';
import { getStudentRoom } from '../api/studentRooms';
import { getStudentProfile } from '../api/profile';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { formatRoomPrice, roomTypeLabels } from '../components/ui/StudentRoomCard';
import { useResidence } from '../context/ResidenceContext';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList, StudentTabsParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'RegisterRoom'>;
export function RegisterRoomScreen({ navigation, route }: Props) {
  const { session, createBackendApplication, refreshBackendApplications } = useResidence();
  const parsedId = /^\d+$/.test(route.params.roomId) ? Number(route.params.roomId) : null;
  const roomId = parsedId != null && Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const [room, setRoom] = useState<StudentRoomDto | null>(null);
  const [needsCic, setNeedsCic] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);
  const submittingRef = useRef(false);
  const canApplyByState = session.status === 'none' || session.status === 'rejected';

  useFocusEffect(useCallback(() => {
    let active = true;
    setRoom(null);
    setNeedsCic(null);
    setError(undefined);
    setLoading(true);
    if (roomId == null) { setError('Không tìm thấy phòng đã chọn.'); setLoading(false); return () => { active = false; }; }
    void Promise.all([getStudentRoom(roomId), getStudentProfile()]).then(([result, profile]) => {
      if (active) {
        setRoom(result.roomId === roomId ? result : null);
        setNeedsCic(!/^[0-9]{12}$/.test(profile.cic ?? ''));
      }
    }).catch(() => { if (active) setError('Không thể tải thông tin phòng. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [roomId, reloadKey]));

  const submit = async () => {
    if (submittingRef.current || roomId == null || !room || !canApplyByState || needsCic !== false) return;
    if (note.length > 2000) { setError('Ghi chú không được vượt quá 2.000 ký tự.'); return; }
    submittingRef.current = true;
    setSubmitting(true);
    setError(undefined);
    try {
      const profile = await getStudentProfile();
      if (!/^[0-9]{12}$/.test(profile.cic ?? '')) {
        setNeedsCic(true);
        setError('Vui lòng cập nhật số CCCD hợp lệ trước khi đăng ký phòng.');
        return;
      }
      const latest = await getStudentRoom(roomId);
      setRoom(latest);
      if (latest.roomId !== roomId || !latest.availableForApplication || !latest.eligibleForStudent) {
        setError('Phòng này hiện không thể đăng ký. Vui lòng chọn phòng khác.');
        return;
      }
      await createBackendApplication(latest.roomId, note);
      navigation.replace('RequestStatus');
    } catch (submitError) {
      try {
        const applications = await refreshBackendApplications();
        if (applications.some((item) => item.status === 'PENDING' || item.status === 'APPROVED')) {
          navigation.replace('RequestStatus');
          return;
        }
      } catch { /* Keep the original request error visible. */ }
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi đơn đăng ký. Vui lòng thử lại.');
      try { setRoom(await getStudentRoom(roomId)); } catch { /* The request error remains visible. */ }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Đăng ký phòng" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {loading ? <Text style={styles.message}>Đang kiểm tra thông tin phòng...</Text> : null}
      {!loading && !room ? <View style={styles.state}><Text style={styles.message}>{error ?? 'Không tìm thấy phòng đã chọn.'}</Text>
        <AppButton title="Thử lại" variant="outline" onPress={() => setReloadKey((value) => value + 1)} /></View> : null}
      {room ? <>
        <SurfaceCard><Text style={styles.title}>Phòng {room.roomNumber}</Text>
          <Text style={styles.message}>{room.buildingName}</Text>
          <DetailRow label="Loại phòng" value={roomTypeLabels[room.roomType]} />
          <DetailRow label="Đang ở" value={`${room.currentOccupancy}/${room.capacity} người`} />
          <DetailRow label="Chỗ còn nhận đơn" value={`${room.remainingSlots} chỗ`} />
          <DetailRow label="Giá mỗi tháng" value={formatRoomPrice(room.pricePerMonth)} last />
        </SurfaceCard>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!canApplyByState ? <View style={styles.state}><Text style={styles.message}>Bạn đã có đăng ký hoặc phòng hiện tại.</Text>
          <AppButton title="Xem trạng thái đăng ký" variant="outline" onPress={() => navigation.navigate('RequestStatus')} /></View> :
          needsCic ? <View style={styles.state}><Text style={styles.message}>Vui lòng cập nhật số CCCD gồm 12 chữ số trước khi đăng ký phòng.</Text>
            <AppButton title="Cập nhật CCCD" variant="outline" onPress={() => navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>()?.navigate('Profile', { screen: 'CCCDInput' })} /></View> :
          !room.eligibleForStudent || !room.availableForApplication ? <Text style={styles.message}>Phòng này hiện không thể đăng ký với hồ sơ của bạn.</Text> : <>
            <Text style={styles.label}>Ghi chú (không bắt buộc)</Text>
            <TextInput value={note} onChangeText={(value) => { setNote(value); setError(undefined); }} multiline
              maxLength={2000} placeholder="Nhập ghi chú cho đơn đăng ký" placeholderTextColor={colors.placeholder}
              style={styles.note} accessibilityLabel="Ghi chú đăng ký phòng" />
            <AppButton title={submitting ? 'Đang gửi đơn...' : 'Gửi đơn đăng ký'} disabled={submitting || loading}
              onPress={() => void submit()} />
          </>}
      </> : null}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 28 }, state: { gap: 12 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 17, marginBottom: 6 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  label: { color: colors.text, fontFamily: typography.bold, fontSize: 13 },
  note: { minHeight: 88, textAlignVertical: 'top', backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, padding: 12, color: colors.text, fontFamily: typography.regular, fontSize: 13 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 },
});
