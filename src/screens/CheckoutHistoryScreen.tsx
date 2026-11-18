import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text as TamaText, XStack, YStack } from 'tamagui';

import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { listCheckoutRequests } from '../api/student';
import type { CheckoutRequestDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'CheckoutHistory'>;
const labels: Record<CheckoutRequestDto['status'], string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Không được duyệt', COMPLETED: 'Đã hoàn tất', CANCELLED: 'Đã hủy' };

export function CheckoutHistoryScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<readonly CheckoutRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(undefined);
    listCheckoutRequests().then(({ data }) => { if (active) setRequests(data.content); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được lịch sử trả phòng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử trả phòng" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content}>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <SurfaceCard style={styles.errorCard}><TamaText style={styles.error}>{error}</TamaText><TamaText onPress={() => setReload((value) => value + 1)} style={styles.retry}>Thử lại</TamaText></SurfaceCard> : requests.length ? requests.map((item) => <SurfaceCard key={item.checkoutRequestId} style={styles.card}><XStack style={styles.top}><TamaText style={styles.title}>Yêu cầu #{item.checkoutRequestId}</TamaText><TamaText style={[styles.badge, item.status === 'COMPLETED' ? styles.complete : item.status === 'REJECTED' ? styles.rejected : item.status === 'CANCELLED' ? styles.cancelled : styles.pending]}>{labels[item.status]}</TamaText></XStack><TamaText style={styles.meta}>Gửi ngày {new Date(item.requestDate).toLocaleDateString('vi-VN')}</TamaText>{item.checkoutDate ? <TamaText style={styles.meta}>Ngày trả phòng: {new Date(item.checkoutDate).toLocaleDateString('vi-VN')}</TamaText> : null}{item.reason ? <TamaText style={styles.body}>{item.reason}</TamaText> : null}{item.note ? <TamaText style={styles.review}>Phản hồi: {item.note}</TamaText> : null}</SurfaceCard>) : <SurfaceCard style={styles.empty}><YStack style={styles.emptyIcon}><TamaText style={styles.emptyGlyph}>↗</TamaText></YStack><TamaText style={styles.title}>Chưa có yêu cầu trả phòng</TamaText><TamaText style={styles.body}>Các yêu cầu trả phòng trước đây sẽ xuất hiện tại đây.</TamaText></SurfaceCard>}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, gap: 12 }, card: { gap: 8, padding: 15 }, top: { justifyContent: 'space-between', alignItems: 'center', gap: 8 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 13 }, badge: { overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, fontFamily: typography.bold, fontSize: 10 }, pending: { color: colors.warningText, backgroundColor: colors.limitedBackground }, complete: { color: colors.availableText, backgroundColor: colors.availableBackground }, rejected: { color: colors.error, backgroundColor: colors.rejectionBackground }, cancelled: { color: colors.textSecondary, backgroundColor: colors.fullBackground }, meta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11 }, body: { color: colors.text, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, review: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, empty: { alignItems: 'center', gap: 8, padding: 22 }, emptyIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.actionIconBackground, alignItems: 'center', justifyContent: 'center' }, emptyGlyph: { color: colors.primary, fontFamily: typography.bold, fontSize: 20 }, errorCard: { gap: 8, backgroundColor: colors.rejectionBackground }, error: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 12 },
});
