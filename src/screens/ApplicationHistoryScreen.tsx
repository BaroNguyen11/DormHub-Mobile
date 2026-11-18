import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text as TamaText, XStack, YStack } from 'tamagui';

import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { getMyDormApplications } from '../api/residence';
import type { DormApplicationDto } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'ApplicationHistory'>;
const labels: Record<DormApplicationDto['status'], string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' };

export function ApplicationHistoryScreen({ navigation }: Props) {
  const [applications, setApplications] = useState<readonly DormApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(undefined);
    getMyDormApplications(0, 100).then(({ data }) => { if (active) setApplications(data.content); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được lịch sử đăng ký.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử đăng ký phòng" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <SurfaceCard style={styles.errorCard}><TamaText style={styles.error}>{error}</TamaText><TamaText accessibilityRole="button" onPress={() => setReload((value) => value + 1)} style={styles.retry}>Thử lại</TamaText></SurfaceCard> : applications.length ? applications.map((application) => <SurfaceCard key={application.id} style={styles.card}><XStack style={styles.top}><YStack style={styles.copy}><TamaText style={styles.room}>Phòng {application.requestedRoomNumber}</TamaText><TamaText style={styles.building}>{application.requestedBuildingName}</TamaText></YStack><TamaText style={[styles.badge, application.status === 'APPROVED' ? styles.approved : application.status === 'REJECTED' ? styles.rejected : application.status === 'CANCELLED' ? styles.cancelled : styles.pending]}>{labels[application.status]}</TamaText></XStack><TamaText style={styles.date}>Gửi ngày {new Date(application.requestDate).toLocaleString('vi-VN')}</TamaText>{application.note ? <TamaText style={styles.note}>Ghi chú: {application.note}</TamaText> : null}{application.reviewNote ? <TamaText style={styles.review}>Phản hồi: {application.reviewNote}</TamaText> : null}</SurfaceCard>) : <SurfaceCard style={styles.emptyCard}><TamaText style={styles.emptyTitle}>Chưa có đơn đăng ký</TamaText><TamaText style={styles.emptyText}>Các yêu cầu đăng ký phòng của bạn sẽ hiển thị tại đây.</TamaText></SurfaceCard>}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, gap: 12 }, card: { gap: 10, padding: 16 }, top: { alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, copy: { flex: 1, gap: 3 }, room: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, building: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 }, badge: { overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, fontFamily: typography.bold, fontSize: 10 }, pending: { color: colors.warningText, backgroundColor: colors.limitedBackground }, approved: { color: colors.availableText, backgroundColor: colors.availableBackground }, rejected: { color: colors.error, backgroundColor: colors.rejectionBackground }, cancelled: { color: colors.textSecondary, backgroundColor: colors.fullBackground }, date: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11 }, note: { color: colors.text, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, review: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, emptyCard: { alignItems: 'center', gap: 7, padding: 22 }, emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, emptyText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 }, errorCard: { gap: 8, backgroundColor: colors.rejectionBackground }, error: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 12 },
});
