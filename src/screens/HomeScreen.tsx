import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconTile, SectionHeader, StudentHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { formatRoomPrice, roomTypeLabels } from '../components/ui/StudentRoomCard';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getStudentRoom } from '../api/studentRooms';
import type { StudentRoomDto } from '../api/studentRooms';
import { useResidence } from '../context/ResidenceContext';
import { useNotifications } from '../context/NotificationContext';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList, RootStackParamList, StudentTabsParamList } from '../types/navigation';
import { ResidenceLandingScreen } from './ResidenceLandingScreen';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeDashboard'>;
export function HomeScreen({ navigation }: Props) {
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const { session } = useResidence();
  const { notifications, isLoading: notificationsLoading, error: notificationsError, refresh: refreshNotifications } = useNotifications();
  const [room, setRoom] = useState<StudentRoomDto | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [roomReload, setRoomReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    const id = session.backendRoomId;
    if (id == null) { setRoom(null); return () => { active = false; }; }
    setRoomLoading(true);
    setRoomError(false);
    void getStudentRoom(id).then((result) => { if (active) setRoom(result); })
      .catch(() => { if (active) setRoomError(true); })
      .finally(() => { if (active) setRoomLoading(false); });
    return () => { active = false; };
  }, [session.backendRoomId, roomReload]));
  if (session.status !== 'active') return <ResidenceLandingScreen />;
  return <ScreenContainer><StatusBar style="dark" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <StudentHeader onMessage={() => tabs?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Chat')} />
    <Pressable style={styles.roomCard} onPress={() => tabs?.navigate('Room', { screen: 'MyRoom' })}><View style={styles.roomTop}><Text style={styles.roomLabel}>Phòng hiện tại</Text><Text style={styles.activeBadge}>Hiệu lực</Text></View>
      <Text style={styles.roomName}>{room ? `Phòng ${room.roomNumber}` : roomLoading ? 'Đang tải phòng...' : 'Phòng hiện tại'}</Text>
      <Text style={styles.roomMeta}>{room ? `${room.buildingName} · ${roomTypeLabels[room.roomType]}` : 'Thông tin cư trú của bạn'}</Text>
      {room ? <Text style={styles.roomMeta}>Đang ở {room.currentOccupancy}/{room.capacity} · Còn {room.remainingSlots} chỗ · {formatRoomPrice(room.pricePerMonth)}</Text> : null}</Pressable>
    {roomError ? <Pressable onPress={() => setRoomReload((value) => value + 1)}><Text style={styles.notice}>Không thể tải thông tin phòng. Chạm để thử lại.</Text></Pressable> : null}
    <SectionHeader title="Hành động nhanh" /><View style={styles.quick}><IconTile icon="tool" label="Báo sửa chữa" onPress={() => navigation.navigate('RepairRequestList')} /><IconTile icon="file-text" label="Hóa đơn" onPress={() => tabs?.navigate('Invoice', { screen: 'InvoiceList' })} /><IconTile icon="zap" label="Điện nước" onPress={() => tabs?.navigate('Room', { screen: 'Utilities' })} /><IconTile icon="file" label="Hợp đồng" onPress={() => tabs?.navigate('Room', { screen: 'Contract' })} /></View>
    <SectionHeader title="Thông báo gần đây" action="Xem tất cả" onAction={() => tabs?.navigate('Notifications')} /><SurfaceCard>{notificationsLoading ? <Text style={styles.notificationMessage}>Đang tải thông báo...</Text> : notificationsError ? <Pressable onPress={refreshNotifications}><Text style={styles.notificationMessage}>Không tải được thông báo. Chạm để thử lại.</Text></Pressable> : notifications.length ? notifications.slice(0, 3).map((item) => <View key={item.id} style={styles.notification}><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.notificationMessage}>{item.summary}</Text></View></View>) : <Text style={styles.notificationMessage}>Chưa có thông báo.</Text>}</SurfaceCard>
  </ScrollView></ScreenContainer>;

}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, paddingBottom: 16, gap: 16 }, roomCard: { backgroundColor: colors.primary, borderRadius: radius.card, padding: 18 }, roomTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, roomLabel: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12 }, activeBadge: { color: colors.surface, backgroundColor: '#4B5D91', overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11.5 }, roomName: { color: colors.surface, fontFamily: typography.regular, fontSize: 21, marginTop: 3 }, roomMeta: { color: '#C7D0EA', fontFamily: typography.regular, fontSize: 12.5, marginTop: 6 },
  invoiceCard: { padding: 18 }, invoiceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, invoiceMonth: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, unpaid: { color: colors.limitedText, backgroundColor: colors.limitedBackground, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, fontFamily: typography.bold, fontSize: 11 }, paid: { color: colors.availableText, backgroundColor: colors.availableBackground }, invoicePrice: { color: colors.text, fontFamily: typography.regular, fontSize: 22 }, due: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12, marginBottom: 14 }, dueText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, quick: { flexDirection: 'row', marginTop: -4, marginBottom: 2 }, utilities: { flexDirection: 'row', gap: 12 },
  notification: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }, notificationBorder: { borderTopWidth: 0.8, borderTopColor: colors.border }, notificationIcon: { width: 38, height: 38, borderRadius: radius.button, backgroundColor: colors.fullBackground, justifyContent: 'center', alignItems: 'center' }, notificationCopy: { flex: 1 }, notificationTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 12.5 }, notificationMessage: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 2 }, notificationTime: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11 }, notice: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18, paddingHorizontal: 4 },
});
