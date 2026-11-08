import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApplicationRoomCard } from '../components/ui/ApplicationRoomCard';
import { AppButton } from '../components/ui/AppButton';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function RequestStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session, application, cancelApplication, cancelBackendApplication } = useResidence();
  const backendApplication = session.backendApplication;
  if (backendApplication) {
    const backendStatusLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' } as const;
    const cancelBackend = () => Alert.alert('Hủy yêu cầu', 'Bạn muốn hủy đơn đăng ký phòng này?', [{ text: 'Giữ lại', style: 'cancel' }, { text: 'Hủy đơn', style: 'destructive', onPress: () => { void cancelBackendApplication(backendApplication.id).then(() => navigation.replace('Residence')).catch((error: unknown) => Alert.alert('Không thể hủy đơn', error instanceof Error ? error.message : 'Vui lòng thử lại.')); } }]);
    return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SurfaceCard style={styles.backendCard}><Text style={styles.backendTitle}>Đơn #{backendApplication.id} · {backendStatusLabels[backendApplication.status]}</Text><Text style={styles.backendRoom}>{backendApplication.requestedRoomNumber} · {backendApplication.requestedBuildingName}</Text><Text style={styles.backendMeta}>Gửi lúc {backendApplication.requestDate.replace('T', ' ')}</Text>{backendApplication.note ? <Text style={styles.backendNote}>Ghi chú: {backendApplication.note}</Text> : null}{backendApplication.reviewNote ? <Text style={styles.backendNote}>Phản hồi: {backendApplication.reviewNote}</Text> : null}</SurfaceCard>
      {backendApplication.status === 'PENDING' ? <Pressable style={styles.cancel} onPress={cancelBackend}><Text style={styles.cancelText}>Hủy yêu cầu</Text></Pressable> : null}
    </ScrollView></ScreenContainer>;
  }
  if (!application || (session.status !== 'pending' && session.status !== 'rejected')) return <ScreenContainer><Text style={styles.missing}>Không có yêu cầu đăng ký.</Text></ScreenContainer>;
  const rejected = session.status === 'rejected';
  const cancel = () => Alert.alert('Hủy yêu cầu', 'Bạn muốn hủy yêu cầu đăng ký phòng?', [{ text: 'Giữ lại', style: 'cancel' }, { text: 'Hủy yêu cầu', style: 'destructive', onPress: () => { cancelApplication(); navigation.replace('FindRoom'); } }]);
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <ApplicationRoomCard roomId={application.roomId} subtitle={`Gửi lúc ${application.sentTime}, ${application.sentDate}`} />
    <SurfaceCard style={styles.timeline}><View style={styles.line} /><View style={styles.step}><View style={[styles.stepIcon, styles.done]}><Feather name="check" size={16} color={colors.surface} /></View><View><Text style={styles.stepTitle}>Đã gửi yêu cầu</Text><Text style={styles.stepSubtitle}>{application.sentDate} · {application.sentTime}</Text></View></View><View style={styles.step}><View style={[styles.stepIcon, rejected ? styles.rejected : styles.pending]}><Feather name={rejected ? 'x' : 'clock'} size={16} color={colors.surface} /></View><View style={styles.stepCopy}><Text style={styles.stepTitle}>{rejected ? 'Từ chối' : 'Chờ duyệt'}</Text><Text style={styles.stepSubtitle}>{rejected ? `${application.decisionDate} · ${application.decisionTime}` : 'Manager đang xem xét yêu cầu của bạn'}</Text></View></View>{!rejected ? <View style={styles.step}><View style={[styles.stepIcon, styles.future]} /><Text style={styles.futureText}>Đã duyệt</Text></View> : null}</SurfaceCard>
    {rejected && application.rejectionReason ? <View style={styles.reason}><Feather name="alert-triangle" size={17} color={colors.error} /><Text style={styles.reasonText}><Text style={styles.reasonBold}>Lý do: </Text>{application.rejectionReason}</Text></View> : null}
    {rejected ? <AppButton title="Tìm phòng khác" onPress={() => { cancelApplication(); navigation.replace('FindRoom'); }} /> : <Pressable style={styles.cancel} onPress={cancel}><Text style={styles.cancelText}>Hủy yêu cầu</Text></Pressable>}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 }, backendCard: { padding: 18, gap: 10 }, backendTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, backendRoom: { color: colors.text, fontFamily: typography.regular, fontSize: 14 }, backendMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 }, backendNote: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, timeline: { padding: 18, gap: 18, position: 'relative' }, line: { position: 'absolute', width: 2, height: 86, backgroundColor: colors.inactiveTab, top: 39, left: 29 }, step: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 37 }, stepIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, done: { backgroundColor: colors.availableText }, pending: { backgroundColor: colors.pendingStep }, rejected: { backgroundColor: colors.error }, future: { backgroundColor: colors.fullBackground, borderWidth: 1, borderColor: colors.border }, stepCopy: { flex: 1 }, stepTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, stepSubtitle: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 12, marginTop: 2 }, futureText: { color: colors.inactiveTab, fontFamily: typography.bold, fontSize: 13 }, reason: { backgroundColor: colors.rejectionBackground, borderWidth: 0.8, borderColor: colors.rejectionBorder, borderRadius: radius.button, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, reasonText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12, flex: 1 }, reasonBold: { fontFamily: typography.bold }, cancel: { height: 48, borderWidth: 0.8, borderColor: colors.error, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: colors.error, fontFamily: typography.bold, fontSize: 14 }, missing: { padding: 16, color: colors.text },
});
