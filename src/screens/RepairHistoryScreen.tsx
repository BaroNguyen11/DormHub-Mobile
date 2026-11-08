import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { RepairRequestRow } from '../components/ui/RepairUi';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';

export function RepairHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { requests, isLoading, hasMoreRequests, error, loadMoreRequests } = useRepairs();
  const history = requests.filter((item) => item.collection === 'history');
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử tạo phiếu" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {isLoading ? <Text style={styles.empty}>Đang tải yêu cầu...</Text> : null}
    {error ? <Text style={styles.empty}>{error}</Text> : null}
    <SurfaceCard style={styles.card}>{history.length ? history.map((request, index) => <View key={request.id} style={index > 0 && styles.divider}><RepairRequestRow request={request} variant="history" onPress={request.status !== 'CANCELLED' ? () => navigation.navigate('RepairRequestDetail', { requestId: request.id }) : undefined} /></View>) : !isLoading && !error ? <Text style={styles.empty}>Chưa có lịch sử sửa chữa.</Text> : null}</SurfaceCard>
    {hasMoreRequests ? <Text accessibilityRole="button" onPress={() => void loadMoreRequests()} style={styles.empty}>{isLoading ? 'Đang tải...' : 'Tải thêm'}</Text> : null}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, card: { padding: 14 }, divider: { borderTopWidth: 0.8, borderTopColor: colors.border }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 } });
