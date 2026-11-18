import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { getMyRoommates } from '../api/residence';
import type { RoommateDto } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function MyRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session, refreshResidence } = useResidence();
  const [roommates, setRoommates] = useState<readonly RoommateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(undefined);
    Promise.all([refreshResidence(), getMyRoommates()]).then(([, result]) => { if (active) setRoommates(result.data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được thông tin phòng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshResidence]));
  const room = session.room;
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Phòng của tôi" showBack={false} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <Text style={styles.empty}>{error}</Text> : session.status !== 'active' || !room ? <Text style={styles.empty}>Tài khoản hiện chưa có phòng đang ở.</Text> : <>
      <XStack style={styles.roomHeading}><View><Text style={styles.roomName}>Phòng {room.roomNumber}</Text><Text style={styles.roomMeta}>{room.buildingName} · Tầng {room.floor}</Text></View><Text style={styles.badge}>Đang ở</Text></XStack>
      <SurfaceCard><DetailRow label="Sức chứa" value={`${room.currentOccupancy} / ${room.capacity} người`} /><DetailRow label="Giá phòng" value={`${Number(room.pricePerMonth).toLocaleString('vi-VN')}đ / tháng`} /><DetailRow label="Mã phòng" value={String(room.roomId)} last /></SurfaceCard>
      <SectionHeader title={`Thành viên cùng phòng (${roommates.length})`} />
      {roommates.length ? <SurfaceCard>{roommates.map((member, index) => <View key={`${member.studentCode}-${index}`} style={[styles.member, index > 0 && styles.memberBorder]}><View style={styles.memberAvatar}><Text style={styles.memberInitials}>{member.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi-VN')}</Text></View><View><Text style={styles.memberName}>{member.fullName}</Text><Text style={styles.memberRole}>{member.studentCode}{member.gender ? ` · ${member.gender === 'MALE' ? 'Nam' : 'Nữ'}` : ''}</Text></View></View>)}</SurfaceCard> : <Text style={styles.empty}>Chưa có thành viên cùng phòng.</Text>}
      <AppButton title="Xem hợp đồng" variant="outline" onPress={() => navigation.navigate('Contract')} />
    </>}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 18 }, roomHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, roomName: { color: colors.text, fontFamily: typography.bold, fontSize: 20 }, roomMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 4 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 }, member: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }, memberBorder: { borderTopWidth: 0.8, borderTopColor: colors.border }, memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, memberInitials: { color: colors.surface, fontFamily: typography.semibold, fontSize: 13 }, memberName: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, memberRole: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, textAlign: 'center', padding: 18 } });
