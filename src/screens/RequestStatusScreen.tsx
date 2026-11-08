import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function RequestStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session, cancelBackendApplication, refreshBackendApplications } = useResidence();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try { await refreshBackendApplications(); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [refreshBackendApplications]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const backendApplication = session.backendApplication;
  if (loading || error) return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} />
    <View style={styles.loadingState}><Text style={styles.missing}>{loading ? 'Đang tải đơn đăng ký...' : 'Không thể tải đơn đăng ký. Vui lòng thử lại.'}</Text>
      {error ? <AppButton title="Thử lại" variant="outline" onPress={() => void refresh()} /> : null}</View>
  </ScreenContainer>;
  if (backendApplication) {
    const backendStatusLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' } as const;
    const cancelBackend = () => Alert.alert(
      'Hủy yêu cầu',
      'Bạn muốn hủy đơn đăng ký phòng này?',
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: () => {
            void cancelBackendApplication(backendApplication.id)
              .then(() => navigation.navigate('Residence'))
              .catch(() => Alert.alert('Không thể hủy đơn', 'Vui lòng thử lại sau.'));
          }
        }
      ]
    );
    return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SurfaceCard style={styles.backendCard}><Text style={styles.backendTitle}>Đơn #{backendApplication.id} · {backendStatusLabels[backendApplication.status]}</Text><Text style={styles.backendRoom}>{backendApplication.requestedRoomNumber} · {backendApplication.requestedBuildingName}</Text><Text style={styles.backendMeta}>Gửi lúc {backendApplication.requestDate.replace('T', ' ')}</Text>{backendApplication.note ? <Text style={styles.backendNote}>Ghi chú: {backendApplication.note}</Text> : null}{backendApplication.reviewNote ? <Text style={styles.backendNote}>Phản hồi: {backendApplication.reviewNote}</Text> : null}</SurfaceCard>
      {backendApplication.status === 'PENDING' ? <Pressable style={styles.cancel} onPress={cancelBackend}><Text style={styles.cancelText}>Hủy yêu cầu</Text></Pressable> : null}
    </ScrollView></ScreenContainer>;
  }
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Trạng thái đăng ký" onBack={() => navigation.goBack()} /><Text style={styles.missing}>Chưa có đơn đăng ký phòng.</Text></ScreenContainer>;
}
const styles = StyleSheet.create({
  loadingState: { padding: 16, gap: 12 }, content: { padding: 16, gap: 24 }, backendCard: { padding: 18, gap: 10 }, backendTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, backendRoom: { color: colors.text, fontFamily: typography.regular, fontSize: 14 }, backendMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 }, backendNote: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, timeline: { padding: 18, gap: 18, position: 'relative' }, line: { position: 'absolute', width: 2, height: 86, backgroundColor: colors.inactiveTab, top: 39, left: 29 }, step: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 37 }, stepIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, done: { backgroundColor: colors.availableText }, pending: { backgroundColor: colors.pendingStep }, rejected: { backgroundColor: colors.error }, future: { backgroundColor: colors.fullBackground, borderWidth: 1, borderColor: colors.border }, stepCopy: { flex: 1 }, stepTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, stepSubtitle: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 12, marginTop: 2 }, futureText: { color: colors.inactiveTab, fontFamily: typography.bold, fontSize: 13 }, reason: { backgroundColor: colors.rejectionBackground, borderWidth: 0.8, borderColor: colors.rejectionBorder, borderRadius: radius.button, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }, reasonText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12, flex: 1 }, reasonBold: { fontFamily: typography.bold }, cancel: { height: 48, borderWidth: 0.8, borderColor: colors.error, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: colors.error, fontFamily: typography.regular, fontSize: 12 }, missing: { padding: 16, color: colors.text },
});
