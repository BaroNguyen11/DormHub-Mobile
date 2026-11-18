import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextArea, YStack } from 'tamagui';

import { ApplicationRoomCard } from '../components/ui/ApplicationRoomCard';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { getStudentProfile } from '../api/studentProfile';
import { getRoom, submitDormApplication } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { roomDtoToListItem } from '../utils/room';
import type { RoomListItem } from '../types/room';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';
import type { StudentTabsParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'RegisterRoom'>;
export function RegisterRoomScreen({ navigation, route }: Props) {
  const { session, refreshResidence } = useResidence();
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const [room, setRoom] = useState<RoomListItem | undefined>();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => { let active = true; setLoading(true); getRoom(route.params.roomId, true).then((result) => { if (active) setRoom(roomDtoToListItem(result.data)); }).catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được thông tin phòng.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [route.params.roomId]);
  if (loading) return <ScreenContainer><Text>Đang tải thông tin phòng...</Text></ScreenContainer>;
  if (!room) return <ScreenContainer><Text>{error ?? 'Không tìm thấy phòng.'}</Text></ScreenContainer>;
  const submit = async () => { if (session.status === 'active' || session.status === 'pending') { setError('Bạn đã có yêu cầu hoặc phòng đang hoạt động.'); return; } if (!agreed) { setError('Vui lòng xác nhận thông tin đăng ký.'); return; } setError(undefined); try { const profile = (await getStudentProfile()).data; const missing: string[] = []; if (!profile.dateOfBirth) missing.push('ngày sinh'); if (!profile.gender) missing.push('giới tính'); if (!profile.address) missing.push('địa chỉ'); if (!profile.cic) missing.push('số CCCD'); if (missing.length) { setError(`Vui lòng cập nhật ${missing.join(', ')} trong hồ sơ trước khi đăng ký.`); return; } await submitDormApplication(room.id, note); await refreshResidence(); navigation.replace('RequestStatus'); } catch (cause) { setError(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'Gửi yêu cầu thất bại. Vui lòng thử lại.'); } };
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Đăng ký thuê phòng" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <ApplicationRoomCard roomId={room.id} subtitle={`${room.monthlyPrice.toLocaleString('vi-VN')}đ / tháng · Còn ${room.capacity - room.occupied} chỗ`} />
    <SurfaceCard><DetailRow label="Giá phòng" value={`${room.monthlyPrice.toLocaleString('vi-VN')}đ/tháng`} /><DetailRow label="Tiền cọc" value={`${room.monthlyPrice.toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
    <YStack><Text style={styles.label}>Ghi chú (không bắt buộc)</Text><TextArea size={false} value={note} onChangeText={setNote} placeholder="VD: nguyện vọng ở cùng bạn..." placeholderTextColor="placeholder" style={styles.note} /></YStack>
    <Pressable style={styles.terms} onPress={() => { setAgreed(!agreed); setError(undefined); }}><View style={[styles.checkbox, agreed && styles.checked]}>{agreed ? <Feather name="check" size={14} color={colors.surface} /> : null}</View><Text style={styles.termsText}>Tôi xác nhận thông tin đăng ký là chính xác và đồng ý với nội quy ký túc xá.</Text></Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}{error?.startsWith('Vui lòng cập nhật') ? <AppButton title="Cập nhật hồ sơ" variant="outline" onPress={() => { tabs?.navigate('Profile', { screen: 'EditProfile' }); }} /> : null}<AppButton title="Gửi yêu cầu đăng ký" onPress={submit} />
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 22 }, label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 7 }, note: { height: 60, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, paddingHorizontal: 14, color: colors.text, fontFamily: typography.regular, fontSize: 13 }, terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.primary }, termsText: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, error: { color: colors.error, fontSize: 12 } });
import { Feather } from '@expo/vector-icons';
