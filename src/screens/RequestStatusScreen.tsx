import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { ApplicationRoomCard } from '../components/ui/ApplicationRoomCard';
import { AppButton } from '../components/ui/AppButton';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';
import { cancelDormApplication, getMyDormApplications } from '../api/residence';
import type { DormApplicationDto } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { useResidence } from '../context/ResidenceContext';

export function RequestStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { refreshResidence } = useResidence();
  const [remoteApplication, setRemoteApplication] = useState<DormApplicationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => { let active = true; setLoading(true); setError(undefined); getMyDormApplications().then((result) => { if (active) setRemoteApplication(result.data.content.find((item) => ['PENDING', 'APPROVED', 'REJECTED'].includes(item.status)) ?? null); }).catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được trạng thái đăng ký.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [reload]);
  const status = remoteApplication?.status === 'PENDING' ? 'pending' : remoteApplication?.status === 'REJECTED' ? 'rejected' : remoteApplication?.status === 'APPROVED' ? 'approved' : 'none';
  const createdAt = remoteApplication ? new Date(remoteApplication.requestDate) : null;
  const displayApplication = remoteApplication ? { id: remoteApplication.id, roomId: remoteApplication.requestedRoomNumber, sentDate: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString('vi-VN') : '', sentTime: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '', status: remoteApplication.status, rejectionReason: remoteApplication.reviewNote ?? undefined } : null;
  if (loading) return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><Text style={styles.missing}>Đang tải trạng thái đăng ký...</Text></ScreenContainer>;
  if (error) return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><Text style={styles.missing}>{error}</Text><Pressable onPress={() => setReload((value) => value + 1)}><Text style={styles.cancelText}>Thử lại</Text></Pressable></ScreenContainer>;
  if (!displayApplication || !['pending', 'rejected', 'approved'].includes(status)) return <ScreenContainer><Text style={styles.missing}>Không có yêu cầu đăng ký.</Text></ScreenContainer>;
  const rejected = status === 'rejected';
  const approved = status === 'approved';
  const cancel = () => Alert.alert('Hủy yêu cầu', 'Bạn muốn hủy yêu cầu đăng ký phòng?', [{ text: 'Giữ lại', style: 'cancel' }, { text: 'Hủy yêu cầu', style: 'destructive', onPress: async () => { try { if (remoteApplication) await cancelDormApplication(remoteApplication.id); await refreshResidence(); navigation.replace('Residence'); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Không thể hủy yêu cầu.'); } } }]);
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ApplicationRoomCard roomId={displayApplication.roomId} subtitle={`Gửi lúc ${displayApplication.sentTime}, ${displayApplication.sentDate}`} />
    <AppButton title="Xem lịch sử đăng ký" variant="text" onPress={() => navigation.navigate('ApplicationHistory')} />
    <SurfaceCard style={styles.timeline}><View style={styles.line} /><XStack style={styles.step}><YStack style={[styles.stepIcon, styles.done]}><Feather name="check" size={16} color={colors.surface} /></YStack><YStack><Text style={styles.stepTitle}>Đã gửi yêu cầu</Text><Text style={styles.stepSubtitle}>{displayApplication.sentDate} · {displayApplication.sentTime}</Text></YStack></XStack><XStack style={styles.step}><YStack style={[styles.stepIcon, rejected ? styles.rejected : approved ? styles.done : styles.pending]}><Feather name={rejected ? 'x' : approved ? 'check' : 'clock'} size={16} color={colors.surface} /></YStack><YStack style={styles.stepCopy}><Text style={styles.stepTitle}>{rejected ? 'Từ chối' : approved ? 'Đã duyệt' : 'Chờ duyệt'}</Text><Text style={styles.stepSubtitle}>{rejected ? 'Yêu cầu không được chấp thuận' : approved ? 'Yêu cầu đã được chấp thuận' : 'Manager đang xem xét yêu cầu của bạn'}</Text></YStack></XStack>{!rejected && !approved ? <XStack style={styles.step}><YStack style={[styles.stepIcon, styles.future]} /><Text style={styles.futureText}>Đã duyệt</Text></XStack> : null}</SurfaceCard>
    {rejected && displayApplication.rejectionReason ? <XStack style={styles.reason}><Feather name="alert-triangle" size={17} color={colors.error} /><Text style={styles.reasonText}><Text style={styles.reasonBold}>Lý do: </Text>{displayApplication.rejectionReason}</Text></XStack> : null}
    {rejected ? <AppButton title="Tìm phòng khác" onPress={() => navigation.replace('FindRoom')} /> : !approved ? <><AppButton title="Đổi phòng đã chọn" variant="outline" onPress={() => navigation.navigate('FindRoom')} /><Pressable style={styles.cancel} onPress={cancel}><Text style={styles.cancelText}>Hủy yêu cầu</Text></Pressable></> : <AppButton title="Tiếp tục thanh toán cọc" onPress={() => navigation.replace('Residence')} />}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 }, timeline: { padding: 18, gap: 18, position: 'relative' }, line: { position: 'absolute', width: 2, height: 86, backgroundColor: colors.inactiveTab, top: 39, left: 29 }, step: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 37 }, stepIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, done: { backgroundColor: colors.availableText }, pending: { backgroundColor: colors.pendingStep }, rejected: { backgroundColor: colors.error }, future: { backgroundColor: colors.fullBackground, borderWidth: 1, borderColor: colors.border }, stepCopy: { flex: 1 }, stepTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, stepSubtitle: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 12, marginTop: 2 }, futureText: { color: colors.inactiveTab, fontFamily: typography.bold, fontSize: 13 }, reason: { backgroundColor: colors.rejectionBackground, borderWidth: 0.8, borderColor: colors.rejectionBorder, borderRadius: radius.button, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, reasonText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12, flex: 1 }, reasonBold: { fontFamily: typography.bold }, cancel: { height: 48, borderWidth: 0.8, borderColor: colors.error, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: colors.error, fontFamily: typography.bold, fontSize: 14 }, missing: { padding: 16, color: colors.text },
});
