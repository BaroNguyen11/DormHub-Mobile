import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Input, TextArea, XStack, YStack } from 'tamagui';

import { ApplicationRoomCard } from '../components/ui/ApplicationRoomCard';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { registrationStartDate } from '../mocks/residence';
import { exploreRooms } from '../mocks/rooms';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'RegisterRoom'>;
export function RegisterRoomScreen({ navigation, route }: Props) {
  const { session, submitApplication } = useResidence();
  const room = exploreRooms.find((item) => item.id === route.params.roomId);
  const [date, setDate] = useState(registrationStartDate);
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string>();
  if (!room) return <ScreenContainer><Text>Không tìm thấy phòng.</Text></ScreenContainer>;
  const submit = () => { if (session.status !== 'none') { setError('Trạng thái cư trú hiện tại không cho phép đăng ký thêm phòng.'); return; } const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date); const parsed = match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : null; if (!match || !parsed || parsed.getDate() !== Number(match[1]) || parsed.getMonth() !== Number(match[2]) - 1) { setError('Ngày bắt đầu ở chưa hợp lệ.'); return; } if (!agreed) { setError('Vui lòng xác nhận thông tin đăng ký.'); return; } submitApplication(room.id, date, note.trim()); navigation.replace('RequestStatus'); };
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Đăng ký thuê phòng" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <ApplicationRoomCard roomId={room.id} subtitle={`${room.monthlyPrice.toLocaleString('vi-VN')}đ / tháng · Còn ${room.capacity - room.occupied} chỗ`} />
    <YStack><Text style={styles.label}>Ngày bắt đầu ở</Text><XStack style={styles.dateBox}><Input size={false} value={date} onChangeText={(value) => { setDate(value); setError(undefined); }} keyboardType="numbers-and-punctuation" style={styles.dateInput} accessibilityLabel="Ngày bắt đầu ở" borderWidth={0} backgroundColor="transparent" /><Feather name="calendar" size={19} color={colors.inactiveTab} /></XStack></YStack>
    <SurfaceCard><DetailRow label="Giá phòng" value={`${room.monthlyPrice.toLocaleString('vi-VN')}đ/tháng`} /><DetailRow label="Tiền cọc" value={`${room.monthlyPrice.toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
    <YStack><Text style={styles.label}>Ghi chú (không bắt buộc)</Text><TextArea size={false} value={note} onChangeText={setNote} placeholder="VD: nguyện vọng ở cùng bạn..." placeholderTextColor="placeholder" style={styles.note} /></YStack>
    <Pressable style={styles.terms} onPress={() => { setAgreed(!agreed); setError(undefined); }}><View style={[styles.checkbox, agreed && styles.checked]}>{agreed ? <Feather name="check" size={14} color={colors.surface} /> : null}</View><Text style={styles.termsText}>Tôi xác nhận thông tin đăng ký là chính xác và đồng ý với nội quy ký túc xá.</Text></Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}<AppButton title="Gửi yêu cầu đăng ký" onPress={submit} />
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 22 }, label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 7 }, dateBox: { height: 46, borderRadius: radius.button, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' }, dateInput: { flex: 1, color: colors.text, fontFamily: typography.regular, fontSize: 13.5 }, note: { height: 60, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, paddingHorizontal: 14, color: colors.text, fontFamily: typography.regular, fontSize: 13 }, terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: colors.primary }, termsText: { flex: 1, color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, error: { color: colors.error, fontSize: 12 } });
