import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Text as TamaText, XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getRoom } from '../api/residence';
import { ApiError } from '../api/httpClient';
import type { RoomDetail } from '../types/room';
import { roomDtoToDetail } from '../utils/room';
import { colors, radius, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'RoomDetail'>;
const amenityIcons = ['wifi', 'wind', 'droplet', 'book-open'] as const;

export function RoomDetailScreen({ navigation, route }: Props) {
  return <RoomDetailView roomId={route.params.roomId} onBack={() => navigation.goBack()} onApply={() => navigation.navigate('Login')} />;
}

interface RoomDetailViewProps { roomId: string; onBack: () => void; onApply: () => void; student?: boolean }
export function RoomDetailView({ roomId, onBack, onApply, student = false }: RoomDetailViewProps) {
  const [room, setRoom] = useState<RoomDetail | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(undefined);
    getRoom(roomId, student).then((result) => { if (active) setRoom(roomDtoToDetail(result.data)); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được thông tin phòng. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [roomId, student, reload]);
  if (loading) return <ScreenContainer><ActivityIndicator color={colors.primary} size="large" /></ScreenContainer>;
  if (error) return <ScreenContainer><Pressable style={styles.back} onPress={onBack}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable><Text style={styles.missing}>{error}</Text><Pressable onPress={() => setReload((value) => value + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable></ScreenContainer>;
  if (!room) return <ScreenContainer><Text style={styles.missing}>Không tìm thấy thông tin phòng.</Text></ScreenContainer>;
  const available = room.capacity - room.occupied;
  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <YStack style={styles.hero}>
          {room.photoAsset ? <Image source={room.photoAsset} contentFit="cover" style={styles.photo} /> : <View style={[styles.photo, styles.photoFallback]} />}
          <Pressable accessibilityLabel="Quay lại" style={styles.back} onPress={onBack}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
          {room.photoAsset ? <View style={styles.counter}><Text style={styles.counterText}>1 / 6</Text></View> : null}
        </YStack>
        <YStack style={styles.main}>
          <XStack style={styles.heading}><YStack><TamaText style={styles.name}>{room.name}</TamaText><TamaText style={styles.location}>{room.building} · Tầng {room.floor}</TamaText></YStack><StatusBadge available={available} /></XStack>
          <XStack style={styles.priceRow}><TamaText style={styles.price}>{room.monthlyPrice.toLocaleString('vi-VN')}đ</TamaText><TamaText style={styles.priceUnit}>/ tháng / người</TamaText></XStack>
          <XStack style={styles.occupancy}><Feather name="users" size={17} color={colors.textSecondary} /><Text style={styles.occupancyText}>{room.occupied}/{room.capacity} người · {available} chỗ trống</Text></XStack>
          {room.amenities.length > 0 ? <><View style={styles.divider} /><Text style={styles.sectionTitle}>Tiện ích</Text><View style={styles.amenities}>{room.amenities.map((item, index) => <View key={item} style={styles.amenity}><Feather name={amenityIcons[index] ?? 'check'} size={17} color={colors.primary} /><Text style={styles.bodyText}>{item}</Text></View>)}</View></> : null}
          {room.description ? <><View style={styles.divider} /><Text style={styles.sectionTitle}>Mô tả</Text><Text style={styles.description}>{room.description}</Text></> : null}
          {room.rules.length > 0 ? <><View style={styles.divider} /><Text style={styles.sectionTitle}>Nội quy phòng</Text>{room.rules.map((rule) => <View key={rule} style={styles.rule}><View style={styles.bullet} /><Text style={styles.bodyText}>{rule}</Text></View>)}</> : null}
        </YStack>
      </ScrollView>
      <YStack style={styles.footer}><AppButton title="Đăng ký thuê phòng" disabled={available === 0} onPress={onApply} /></YStack>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 12 }, hero: { height: 226, marginHorizontal: 7, marginTop: 4 }, photo: { width: '100%', height: '100%', borderRadius: radius.card }, photoFallback: { backgroundColor: colors.roomImageGradientStart },
  back: { position: 'absolute', top: 14, left: 8, width: 36, height: 36, borderRadius: radius.button, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  counter: { position: 'absolute', right: 14, bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }, counterText: { color: colors.surface, fontFamily: typography.semibold, fontSize: 11 },
  main: { paddingHorizontal: 20, paddingTop: 18 }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, name: { color: colors.text, fontFamily: typography.bold, fontSize: 22 }, location: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 16 }, price: { color: colors.primary, fontFamily: typography.bold, fontSize: 21 }, priceUnit: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 }, occupancy: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 }, occupancyText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 }, sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16, marginBottom: 12 }, amenities: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 }, amenity: { width: '50%', flexDirection: 'row', gap: 9, alignItems: 'center' }, bodyText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 20, flexShrink: 1 }, description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 21 }, rule: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }, bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textSecondary },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, borderTopColor: colors.border, borderTopWidth: 1, backgroundColor: colors.surface }, missing: { padding: 20, color: colors.text }, retry: { color: colors.primary, paddingHorizontal: 20, fontFamily: typography.bold },
});
