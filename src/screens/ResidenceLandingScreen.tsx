import { useResidence } from '../context/ResidenceContext';
import { FindRoomScreen } from './FindRoomScreen';
import { MyRoomScreen } from './MyRoomScreen';
import { RequestStatusScreen } from './RequestStatusScreen';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StudentTabsParamList } from '../types/navigation';
import { SurfaceCard } from '../components/ui/ResidenceUi';
import { createCheckoutRequest, listCheckoutRequests, cancelCheckoutRequest } from '../api/student';
import type { CheckoutRequestDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput } from 'react-native';
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
  if (loading) return <ScreenContainer><Text style={styles.message}>Đang tải thông tin lưu trú...</Text></ScreenContainer>;
  if (error) return <ScreenContainer><Text style={styles.message}>{error}</Text><AppButton title="Thử lại" onPress={() => void refreshResidence()} /></ScreenContainer>;
  if (session.status === 'active') return <MyRoomScreen />;
  if (session.status === 'none') return <FindRoomScreen />;
  if (session.status === 'approved') return <ScreenContainer><Text style={styles.title}>Đơn đăng ký đã được duyệt</Text><SurfaceCard style={styles.card}><Text style={styles.message}>Hợp đồng và hóa đơn tiền cọc đã được tạo. Mở mục Hóa đơn để thanh toán tiền cọc; phòng sẽ được phân sau khi giao dịch được xác nhận.</Text></SurfaceCard><AppButton title="Mở hóa đơn" onPress={() => tabs.navigate('Invoice', { screen: 'InvoiceList' })} /></ScreenContainer>;
  if (session.status === 'checkoutPending') return <CheckoutLanding />;
  return <RequestStatusScreen />;
}
const styles = StyleSheet.create({ message: { color: colors.text, padding: 16, fontSize: 14, lineHeight: 20 }, title: { color: colors.text, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 14, fontWeight: '700', fontSize: 18 }, card: { marginHorizontal: 16, marginBottom: 16 } });

function CheckoutLanding() {
  const { session, refreshResidence } = useResidence();
  const [request, setRequest] = useState<CheckoutRequestDto | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError(undefined); listCheckoutRequests().then(({ data }) => { if (active) setRequest(data.content.find((item) => ['PENDING', 'APPROVED'].includes(item.status)) ?? null); }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được yêu cầu trả phòng.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [reload]);
  useEffect(() => { const timer = setInterval(() => { void refreshResidence().catch(() => undefined); setReload((value) => value + 1); }, 30000); return () => clearInterval(timer); }, [refreshResidence]);
  const submit = async () => { if (!reason.trim() || busy) { setError('Vui lòng nhập lý do trả phòng.'); return; } setBusy(true); setError(undefined); try { const result = await createCheckoutRequest(reason); setRequest(result.data); await refreshResidence(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không gửi được yêu cầu trả phòng.'); } finally { setBusy(false); } };
  const cancel = () => Alert.alert('Hủy yêu cầu trả phòng', 'Bạn muốn hủy yêu cầu đang chờ duyệt?', [{ text: 'Giữ lại', style: 'cancel' }, { text: 'Hủy yêu cầu', style: 'destructive', onPress: async () => { if (!request) return; setBusy(true); try { await cancelCheckoutRequest(String(request.checkoutRequestId)); setRequest(null); await refreshResidence(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không hủy được yêu cầu.'); } finally { setBusy(false); } } }]);
  if (loading) return <ScreenContainer><ActivityIndicator color={colors.primary} /></ScreenContainer>;
  return <ScreenContainer><Text style={styles.title}>Trả phòng</Text><ScrollView contentContainerStyle={checkoutStyles.checkoutContent} keyboardShouldPersistTaps="handled">{request ? <SurfaceCard style={styles.card}><Text style={checkoutStyles.requestTitle}>Yêu cầu trả phòng #{request.checkoutRequestId}</Text><Text style={styles.message}>Trạng thái: {request.status === 'PENDING' ? 'Đang chờ quản lý duyệt' : 'Đã duyệt, vui lòng phối hợp với quản lý để hoàn tất trả phòng.'}</Text>{request.reason ? <Text style={styles.message}>Lý do: {request.reason}</Text> : null}{request.status === 'PENDING' ? <AppButton title="Hủy yêu cầu" variant="outline" disabled={busy} onPress={cancel} /> : null}</SurfaceCard> : <SurfaceCard style={styles.card}><Text style={styles.message}>Bạn đang được phân vào phòng {session.roomId}. Gửi yêu cầu trả phòng để quản lý tiếp nhận.</Text><TextInput value={reason} onChangeText={(value) => { setReason(value); setError(undefined); }} placeholder="Nhập lý do trả phòng" multiline textAlignVertical="top" style={checkoutStyles.reasonInput} /><AppButton title={busy ? 'Đang gửi...' : 'Gửi yêu cầu trả phòng'} loading={busy} disabled={busy} onPress={() => void submit()} /></SurfaceCard>}{error ? <Text style={styles.message}>{error}</Text> : null}{error ? <Pressable onPress={() => setReload((value) => value + 1)}><Text style={checkoutStyles.retry}>Tải lại</Text></Pressable> : null}</ScrollView></ScreenContainer>;
}
