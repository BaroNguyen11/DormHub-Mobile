import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useResidence } from '../context/ResidenceContext';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

const assignmentStatusLabels = { ASSIGNED: 'Đã phân phòng', CHECKED_IN: 'Đã nhận phòng', CHECKED_OUT: 'Đã trả phòng', CANCELLED: 'Đã hủy' } as const;

export function MyRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { session } = useResidence();
  const status = session.backendAssignmentStatus;
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Phòng hiện tại" showBack={false} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {session.backendRoomId == null ? <Text style={styles.message}>Chưa có thông tin phòng hiện tại.</Text> : <>
        <View style={styles.roomHeading}><Text style={styles.roomName}>Thông tin cư trú</Text><Text style={styles.badge}>{status ? assignmentStatusLabels[status] : 'Đang phân phòng'}</Text></View>
        <SurfaceCard>
          {session.backendContractId != null ? <DetailRow label="Mã hợp đồng" value={String(session.backendContractId)} /> : null}
          <DetailRow label="Trạng thái phân phòng" value={status ? assignmentStatusLabels[status] : 'Chưa cập nhật'} />
          <DetailRow label="Thời điểm phân phòng" value={session.backendAssignedAt?.replace('T', ' ') ?? 'Chưa cập nhật'} />
          <DetailRow label="Thời điểm nhận phòng" value={session.backendCheckInAt?.replace('T', ' ') ?? 'Chưa cập nhật'} last />
        </SurfaceCard>
        <AppButton title="Xem hợp đồng" variant="outline" onPress={() => navigation.navigate('Contract')} />
      </>}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 18 }, roomHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  roomName: { color: colors.text, fontFamily: typography.regular, fontSize: 20 },
  badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13 },
});
