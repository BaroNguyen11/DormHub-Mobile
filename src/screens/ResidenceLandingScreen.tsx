import { useResidence } from '../context/ResidenceContext';
import { FindRoomScreen } from './FindRoomScreen';
import { MyRoomScreen } from './MyRoomScreen';
import { RequestStatusScreen } from './RequestStatusScreen';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { StyleSheet } from 'react-native';
import { Text, TextArea, YStack } from 'tamagui';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StudentTabsParamList } from '../types/navigation';
import { SurfaceCard } from '../components/ui/ResidenceUi';
import { createCheckoutRequest, listCheckoutRequests, cancelCheckoutRequest } from '../api/student';
import type { CheckoutRequestDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import { radius, typography } from '../theme';

const checkoutStyles = StyleSheet.create({
  checkoutContent: { paddingHorizontal: 16, gap: 12 },
  requestTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  reasonInput: { minHeight: 96, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, padding: 12, color: colors.text, fontFamily: typography.regular, fontSize: 14 },
  retry: { color: colors.primary, fontFamily: typography.bold, padding: 12 },
});

export function ResidenceLandingScreen() {
  const { session, loading, error, refreshResidence } = useResidence();
  const tabs = useNavigation<BottomTabNavigationProp<StudentTabsParamList>>();
  if (loading) return <ScreenContainer><YStack style={styles.statePage}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.stateTitle}>Đang tải thông tin lưu trú</Text><Text style={styles.stateHint}>Đang đồng bộ phòng và yêu cầu của bạn</Text></YStack></ScreenContainer>;
  if (error) return <ScreenContainer><YStack style={styles.statePage}><SurfaceCard style={styles.errorCard}><Text style={styles.title}>Chưa tải được thông tin phòng</Text><Text style={styles.message}>{error}</Text><AppButton title="Thử tải lại" onPress={() => void refreshResidence()} /></SurfaceCard></YStack></ScreenContainer>;
  if (session.status === 'active') return <MyRoomScreen />;
  if (session.status === 'none') return <FindRoomScreen />;
  if (session.status === 'approved') return <ScreenContainer><YStack style={styles.approvedPage}><YStack style={styles.approvedHero}><YStack style={styles.approvedIcon}><Text style={styles.approvedIconText}>✓</Text></YStack><Text style={styles.approvedEyebrow}>CẬP NHẬT ĐĂNG KÝ</Text><Text style={styles.title}>Đơn đăng ký đã được duyệt</Text><Text style={styles.approvedSubtitle}>Bạn đã hoàn tất bước xét duyệt hồ sơ.</Text></YStack><SurfaceCard style={styles.approvedCard}><Text style={styles.message}>Hợp đồng và hóa đơn tiền cọc đã được tạo. Thanh toán tiền cọc để quản lý tiếp tục phân phòng.</Text></SurfaceCard><AppButton title="Xem hóa đơn tiền cọc" onPress={() => tabs.navigate('Invoice', { screen: 'InvoiceList' })} /></YStack></ScreenContainer>;
  if (session.status === 'checkoutPending') return <CheckoutLanding />;
  return <RequestStatusScreen />;
}
const styles = StyleSheet.create({ message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13.5, lineHeight: 21 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 21, lineHeight: 28, textAlign: 'center' }, card: { marginHorizontal: 16, marginBottom: 16 }, statePage: { flex: 1, justifyContent: 'center', padding: 20, gap: 14 }, stateTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 17, textAlign: 'center' }, stateHint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, textAlign: 'center' }, errorCard: { gap: 16, borderColor: colors.rejectionBorder, backgroundColor: colors.surface }, approvedPage: { flex: 1, justifyContent: 'center', padding: 20, gap: 18 }, approvedHero: { alignItems: 'center', gap: 10 }, approvedIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.availableBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, approvedIconText: { color: colors.availableText, fontSize: 30, fontWeight: '700' }, approvedEyebrow: { color: colors.availableText, fontFamily: typography.bold, fontSize: 10, letterSpacing: 1 }, approvedSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, textAlign: 'center', fontSize: 13, lineHeight: 19 }, approvedCard: { padding: 18, borderRadius: 16 }, checkoutPage: { flex: 1, paddingTop: 22 }, checkoutSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19, paddingHorizontal: 16, paddingBottom: 16 }, checkoutHistory: { gap: 10, marginTop: 10 }, historyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15, paddingHorizontal: 16 }, historyCard: { gap: 5, marginHorizontal: 16 }, historyMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, lineHeight: 17 } });

function CheckoutLanding() {
  const { session, refreshResidence } = useResidence();
  const [request, setRequest] = useState<CheckoutRequestDto | null>(null);
  const [history, setHistory] = useState<readonly CheckoutRequestDto[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError(undefined); listCheckoutRequests().then(({ data }) => { if (active) { setHistory(data.content); setRequest(data.content.find((item) => ['PENDING', 'APPROVED'].includes(item.status)) ?? null); } }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được yêu cầu trả phòng.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [reload]);
  useEffect(() => { const timer = setInterval(() => { void refreshResidence().catch(() => undefined); setReload((value) => value + 1); }, 30000); return () => clearInterval(timer); }, [refreshResidence]);
  const submit = async () => { if (!reason.trim() || busy) { setError('Vui lòng nhập lý do trả phòng.'); return; } setBusy(true); setError(undefined); try { const result = await createCheckoutRequest(reason); setRequest(result.data); setHistory((previous) => [result.data, ...previous]); setReason(''); await refreshResidence(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không gửi được yêu cầu trả phòng.'); } finally { setBusy(false); } };
  const cancel = () => Alert.alert('Hủy yêu cầu trả phòng', 'Bạn muốn hủy yêu cầu đang chờ duyệt?', [{ text: 'Giữ lại', style: 'cancel' }, { text: 'Hủy yêu cầu', style: 'destructive', onPress: async () => { if (!request) return; setBusy(true); try { const result = await cancelCheckoutRequest(String(request.checkoutRequestId)); setHistory((previous) => previous.map((item) => item.checkoutRequestId === request.checkoutRequestId ? result.data : item)); setRequest(null); await refreshResidence(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không hủy được yêu cầu.'); } finally { setBusy(false); } } }]);
  if (loading) return <ScreenContainer><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  return <ScreenContainer><YStack style={styles.checkoutPage}><Text style={styles.title}>Trả phòng</Text><Text style={styles.checkoutSubtitle}>Quản lý yêu cầu trả phòng và cập nhật tình trạng lưu trú.</Text><ScrollView contentContainerStyle={checkoutStyles.checkoutContent} keyboardShouldPersistTaps="handled">{request ? <SurfaceCard style={styles.card}><Text style={checkoutStyles.requestTitle}>Yêu cầu trả phòng #{request.checkoutRequestId}</Text><Text style={styles.message}>Trạng thái: {request.status === 'PENDING' ? 'Đang chờ quản lý duyệt' : 'Đã duyệt, vui lòng phối hợp với quản lý để hoàn tất trả phòng.'}</Text>{request.reason ? <Text style={styles.message}>Lý do: {request.reason}</Text> : null}{request.status === 'PENDING' ? <AppButton title="Hủy yêu cầu" variant="outline" disabled={busy} onPress={cancel} /> : null}</SurfaceCard> : <SurfaceCard style={styles.card}><Text style={styles.message}>Bạn đang được phân vào phòng {session.roomId}. Gửi yêu cầu trả phòng để quản lý tiếp nhận.</Text><TextArea size={false} value={reason} onChangeText={(value) => { setReason(value); setError(undefined); }} placeholder="Nhập lý do trả phòng" textAlignVertical="top" style={checkoutStyles.reasonInput} /><AppButton title={busy ? 'Đang gửi...' : 'Gửi yêu cầu trả phòng'} loading={busy} disabled={busy} onPress={() => void submit()} /></SurfaceCard>}{error ? <Text style={styles.message}>{error}</Text> : null}{error ? <Pressable onPress={() => setReload((value) => value + 1)}><Text style={checkoutStyles.retry}>Tải lại</Text></Pressable> : null}{history.length ? <YStack style={styles.checkoutHistory}><Text style={styles.historyTitle}>Lịch sử yêu cầu</Text>{history.filter((item) => item.checkoutRequestId !== request?.checkoutRequestId).map((item) => <SurfaceCard key={item.checkoutRequestId} style={styles.historyCard}><Text style={checkoutStyles.requestTitle}>Yêu cầu #{item.checkoutRequestId}</Text><Text style={styles.message}>{item.status === 'COMPLETED' ? 'Đã hoàn tất' : item.status === 'REJECTED' ? 'Không được duyệt' : item.status === 'CANCELLED' ? 'Đã hủy' : item.status}</Text><Text style={styles.historyMeta}>{new Date(item.requestDate).toLocaleDateString('vi-VN')}{item.reason ? ` · ${item.reason}` : ''}</Text></SurfaceCard>)}</YStack> : null}</ScrollView></YStack></ScreenContainer>;
}
