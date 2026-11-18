import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { Text as TamaText, TextArea, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { cancelRoomTransferRequest, createRoomTransferRequest, listRoomTransferRequests } from '../api/student';
import type { RoomTransferRequestDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { useResidence } from '../context/ResidenceContext';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'RoomTransfer'>;
const statusLabels: Record<RoomTransferRequestDto['status'], string> = { PENDING: 'Chờ quản lý duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Không được duyệt', CANCELLED: 'Đã hủy' };

export function RoomTransferScreen({ navigation }: Props) {
  const { session, refreshResidence } = useResidence();
  const [requests, setRequests] = useState<readonly RoomTransferRequestDto[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    listRoomTransferRequests().then(({ data }) => { if (active) setRequests(data.content); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được yêu cầu chuyển phòng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]));

  const pending = requests.find((request) => request.status === 'PENDING');
  const canRequest = session.room?.assignmentStatus === 'CHECKED_IN';
  const submit = async () => {
    if (busy) return;
    if (reason.trim().length < 5) { setError('Vui lòng mô tả lý do chuyển phòng (ít nhất 5 ký tự).'); return; }
    setBusy(true); setError(undefined);
    try {
      const result = await createRoomTransferRequest(reason);
      setRequests((previous) => [result.data, ...previous]);
      setReason('');
      await refreshResidence();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Không gửi được yêu cầu chuyển phòng.');
    } finally { setBusy(false); }
  };

  const confirmCancel = (request: RoomTransferRequestDto) => Alert.alert('Hủy yêu cầu chuyển phòng', 'Bạn có muốn hủy yêu cầu đang chờ duyệt không?', [
    { text: 'Giữ yêu cầu', style: 'cancel' },
    { text: 'Hủy yêu cầu', style: 'destructive', onPress: async () => {
      setBusy(true); setError(undefined);
      try { const result = await cancelRoomTransferRequest(request.transferId); setRequests((previous) => previous.map((item) => item.transferId === request.transferId ? result.data : item)); }
      catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không hủy được yêu cầu.'); }
      finally { setBusy(false); }
    } },
  ]);

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Chuyển phòng" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <SurfaceCard style={styles.introCard}><YStack style={styles.introIcon}><Feather name="repeat" size={20} color={colors.primary} /></YStack><TamaText style={styles.heading}>Yêu cầu chuyển phòng</TamaText><TamaText style={styles.body}>Quản lý ký túc xá sẽ xem xét lý do và sắp xếp phòng phù hợp. Yêu cầu không thay đổi phòng hiện tại cho đến khi được xử lý.</TamaText></SurfaceCard>

      {pending ? <SurfaceCard style={styles.requestCard}><TamaText style={styles.sectionTitle}>Yêu cầu đang chờ</TamaText><TamaText style={styles.body}>Gửi ngày {new Date(pending.requestedAt).toLocaleDateString('vi-VN')}</TamaText><TamaText style={styles.body}>Lý do: {pending.reason}</TamaText><TamaText style={styles.statusPending}><Feather name="clock" size={14} />  {statusLabels[pending.status]}</TamaText><AppButton title="Hủy yêu cầu" variant="outline" disabled={busy} onPress={() => confirmCancel(pending)} /></SurfaceCard> : canRequest ? <SurfaceCard style={styles.formCard}><TamaText style={styles.sectionTitle}>Bạn muốn chuyển phòng vì lý do gì?</TamaText><TamaText style={styles.helper}>Nêu rõ nhu cầu để quản lý xem xét và đề xuất phòng.</TamaText><TextArea size={false} value={reason} onChangeText={(value) => { setReason(value); setError(undefined); }} placeholder="Nhập lý do chuyển phòng" maxLength={1000} textAlignVertical="top" style={styles.textArea} /><TamaText style={styles.counter}>{reason.length}/1000</TamaText><AppButton title={busy ? 'Đang gửi yêu cầu…' : 'Gửi yêu cầu'} loading={busy} disabled={busy} onPress={() => void submit()} /></SurfaceCard> : <SurfaceCard style={styles.infoCard}><Feather name="info" size={18} color={colors.warningIcon} /><TamaText style={styles.body}>Bạn cần hoàn tất nhận phòng trước khi gửi yêu cầu chuyển phòng.</TamaText></SurfaceCard>}

      {error ? <SurfaceCard style={styles.errorCard}><TamaText style={styles.errorText}>{error}</TamaText><TamaText accessibilityRole="button" style={styles.retry} onPress={() => setReload((value) => value + 1)}>Tải lại</TamaText></SurfaceCard> : null}
      <TamaText style={styles.sectionTitle}>Lịch sử yêu cầu</TamaText>
      {loading ? <ActivityIndicator color={colors.primary} /> : requests.length ? requests.map((request) => <SurfaceCard key={request.transferId} style={styles.historyCard}><TamaText style={styles.historyTitle}>Yêu cầu #{request.transferId}</TamaText><TamaText style={request.status === 'REJECTED' ? styles.statusRejected : styles.historyStatus}>{statusLabels[request.status]}</TamaText><TamaText style={styles.body}>{request.reason}</TamaText>{request.reviewNote ? <TamaText style={styles.reviewNote}>Phản hồi: {request.reviewNote}</TamaText> : null}<TamaText style={styles.date}>{new Date(request.requestedAt).toLocaleString('vi-VN')}</TamaText></SurfaceCard>) : !error ? <TamaText style={styles.empty}>Bạn chưa gửi yêu cầu chuyển phòng nào.</TamaText> : null}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28, gap: 14 }, introCard: { gap: 9, padding: 18 }, introIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.actionIconBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 3 }, heading: { color: colors.text, fontFamily: typography.bold, fontSize: 18 }, sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, body: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 19 }, formCard: { gap: 10, padding: 17 }, helper: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, textArea: { minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, padding: 12, backgroundColor: colors.surface, color: colors.text, fontFamily: typography.regular, fontSize: 13 }, counter: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11, textAlign: 'right', marginTop: -6 }, requestCard: { gap: 10, padding: 17 }, statusPending: { color: colors.warningText, fontFamily: typography.bold, fontSize: 12, flexDirection: 'row', alignItems: 'center' }, infoCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.limitedBackground, borderColor: '#F2DFBA' }, errorCard: { gap: 8, backgroundColor: colors.rejectionBackground, borderColor: colors.rejectionBorder }, errorText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 19 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 12 }, historyCard: { gap: 7 }, historyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13 }, historyStatus: { color: colors.warningText, fontFamily: typography.bold, fontSize: 12 }, statusRejected: { color: colors.error, fontFamily: typography.bold, fontSize: 12 }, reviewNote: { color: colors.text, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, date: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, textAlign: 'center', paddingVertical: 14 },
});
