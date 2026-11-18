import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text as TamaText, View as TamaView, XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { getMyRoommates } from '../api/residence';
import type { RoommateDto } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function MyRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session, refreshResidence } = useResidence();
  const [roommates, setRoommates] = useState<readonly RoommateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useFocusEffect(useCallback(() => {
    let active = true;
    void refreshResidence();
    setLoading(true);
    setError(undefined);
    getMyRoommates()
      .then((result) => { if (active) setRoommates(result.data); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được danh sách thành viên cùng phòng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshResidence]));

  const room = session.room;
  return <ScreenContainer>
    <StatusBar style="dark" />
    <ResidenceHeader title="Phòng của tôi" showBack={false} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {room ? <>
        <SurfaceCard style={styles.roomCard}>
          <XStack style={styles.roomHeading}>
            <YStack style={styles.roomCopy}>
              <TamaText style={styles.eyebrow}>PHÒNG HIỆN TẠI</TamaText>
              <TamaText style={styles.roomName}>Phòng {room.roomNumber}</TamaText>
              <XStack style={styles.location}><Feather name="map-pin" size={14} color={colors.textSecondary} /><TamaText style={styles.roomMeta}>{room.buildingName} · Tầng {room.floor}</TamaText></XStack>
            </YStack>
            <XStack style={styles.badge}><TamaView style={styles.badgeDot} /><TamaText style={styles.badgeText}>Đang ở</TamaText></XStack>
          </XStack>
          <XStack style={styles.metrics}>
            <YStack style={styles.metric}><TamaText style={styles.metricLabel}>Sức chứa</TamaText><TamaText style={styles.metricValue}>{room.currentOccupancy}<TamaText style={styles.metricMuted}> / {room.capacity}</TamaText></TamaText></YStack>
            <TamaView style={styles.metricDivider} />
            <YStack style={styles.metric}><TamaText style={styles.metricLabel}>Giá phòng</TamaText><TamaText style={styles.metricValue}>{Number(room.pricePerMonth).toLocaleString('vi-VN')}đ<TamaText style={styles.metricMuted}> / tháng</TamaText></TamaText></YStack>
          </XStack>
          <DetailRow label="Mã phòng" value={String(room.roomId)} last />
        </SurfaceCard>

        <XStack style={styles.sectionTop}><SectionHeader title="Thành viên cùng phòng" /><TamaText style={styles.memberCount}>{roommates.length}</TamaText></XStack>
        {loading ? <SurfaceCard style={styles.stateCard}><ActivityIndicator color={colors.primary} /><TamaText style={styles.stateText}>Đang tải danh sách thành viên…</TamaText></SurfaceCard> : null}
        {error ? <SurfaceCard style={styles.errorCard}><Feather name="wifi-off" size={18} color={colors.error} /><YStack style={styles.errorCopy}><TamaText style={styles.errorTitle}>Chưa tải được thành viên</TamaText><TamaText style={styles.stateText}>{error}</TamaText><TamaText accessibilityRole="button" style={styles.retry} onPress={() => { setError(undefined); setLoading(true); getMyRoommates().then((result) => setRoommates(result.data)).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Không tải được danh sách thành viên.')).finally(() => setLoading(false)); }}>Thử tải lại</TamaText></YStack></SurfaceCard> : null}
        {!loading && !error && roommates.length ? <SurfaceCard style={styles.memberCard}>{roommates.map((member, index) => <XStack key={`${member.studentCode}-${index}`} style={[styles.member, index > 0 && styles.memberBorder]}><TamaView style={[styles.memberAvatar, index > 0 && styles.memberAvatarAlt]}><TamaText style={styles.memberInitials}>{member.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toLocaleUpperCase('vi-VN')}</TamaText></TamaView><YStack style={styles.memberCopy}><TamaText style={styles.memberName}>{member.fullName}</TamaText><TamaText style={styles.memberRole}>{member.studentCode}{member.gender ? ` · ${member.gender === 'MALE' ? 'Nam' : 'Nữ'}` : ''}</TamaText></YStack><Feather name="chevron-right" size={18} color={colors.inactiveTab} /></XStack>)}</SurfaceCard> : null}
        {!loading && !error && !roommates.length ? <SurfaceCard style={styles.emptyCard}><TamaView style={styles.emptyIcon}><Feather name="users" size={20} color={colors.primary} /></TamaView><TamaText style={styles.emptyTitle}>Phòng chưa có thành viên khác</TamaText><TamaText style={styles.stateText}>Thông tin sẽ được cập nhật khi có sinh viên cùng phòng.</TamaText></SurfaceCard> : null}
        <AppButton title="Xem hợp đồng thuê phòng" variant="outline" onPress={() => navigation.navigate('Contract')} />
        {room.assignmentStatus === 'CHECKED_IN' ? <AppButton title="Yêu cầu chuyển phòng" variant="outline" onPress={() => navigation.navigate('RoomTransfer')} /> : null}
      </> : <SurfaceCard style={styles.emptyCard}><TamaText style={styles.emptyTitle}>Chưa có thông tin phòng</TamaText><TamaText style={styles.stateText}>Kéo xuống để tải lại dữ liệu lưu trú.</TamaText><AppButton title="Tải lại" variant="outline" onPress={() => void refreshResidence()} /></SurfaceCard>}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28, gap: 16 },
  roomCard: { padding: 18, gap: 16, borderRadius: 18 }, roomHeading: { justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, roomCopy: { flex: 1, gap: 5 }, eyebrow: { color: colors.textSecondary, fontFamily: typography.bold, fontSize: 10, letterSpacing: 1 }, roomName: { color: colors.text, fontFamily: typography.bold, fontSize: 24 }, location: { alignItems: 'center', gap: 6 }, roomMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
  badge: { backgroundColor: colors.availableBackground, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', gap: 6 }, badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.availableText }, badgeText: { color: colors.availableText, fontFamily: typography.bold, fontSize: 11 },
  metrics: { backgroundColor: colors.background, borderRadius: 12, padding: 13, alignItems: 'center' }, metric: { flex: 1, gap: 5 }, metricLabel: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5 }, metricValue: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, metricMuted: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11 }, metricDivider: { width: 1, height: 34, backgroundColor: colors.border, marginHorizontal: 12 },
  sectionTop: { alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }, memberCount: { backgroundColor: colors.actionIconBackground, color: colors.primary, fontFamily: typography.bold, fontSize: 12, minWidth: 26, textAlign: 'center', borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 4 }, memberCard: { paddingVertical: 4 }, member: { alignItems: 'center', gap: 12, minHeight: 66 }, memberBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, memberAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, memberAvatarAlt: { backgroundColor: colors.roomMemberSecond }, memberInitials: { color: colors.surface, fontFamily: typography.bold, fontSize: 13 }, memberCopy: { flex: 1, gap: 3 }, memberName: { color: colors.text, fontFamily: typography.bold, fontSize: 13 }, memberRole: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5 },
  stateCard: { flexDirection: 'row', alignItems: 'center', gap: 12 }, stateText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, errorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.rejectionBackground, borderColor: colors.rejectionBorder }, errorCopy: { flex: 1, gap: 5 }, errorTitle: { color: colors.rejectionText, fontFamily: typography.bold, fontSize: 13 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 12, paddingTop: 2 }, emptyCard: { alignItems: 'center', gap: 9, padding: 20 }, emptyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.actionIconBackground, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 14, textAlign: 'center' },
});
