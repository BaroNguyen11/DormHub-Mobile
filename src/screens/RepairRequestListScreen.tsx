import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { FilterChip } from '../components/ui/FilterChip';
import { RepairRequestRow } from '../components/ui/RepairUi';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { useResidence } from '../context/ResidenceContext';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';

type Filter = 'all' | 'processing' | 'completed';
const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tất cả' }, { id: 'processing', label: 'Đang xử lý' }, { id: 'completed', label: 'Hoàn thành' }];
export function RepairRequestListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { requests } = useRepairs();
  const { session } = useResidence();
  const [filter, setFilter] = useState<Filter>('all');
  const current = requests.filter((item) => item.collection === 'current' && (filter === 'all' || (filter === 'processing' && item.status === 'IN_PROGRESS') || (filter === 'completed' && item.status === 'COMPLETED')));
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Sửa chữa" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><XStack style={styles.filters}>{filters.map((item) => <FilterChip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />)}</XStack><SurfaceCard style={styles.list}>{current.length ? current.map((request, index) => <View key={request.id} style={index > 0 && styles.divider}><RepairRequestRow request={request} variant="current" onPress={() => navigation.navigate('RepairRequestDetail', { requestId: request.id })} /></View>) : <Text style={styles.empty}>Không có yêu cầu trong mục này.</Text>}</SurfaceCard><XStack style={styles.actions}><YStack style={styles.action}><AppButton title="Xem lịch sử" variant="outline" onPress={() => navigation.navigate('RepairHistory')} /></YStack><YStack style={styles.action}><AppButton title="＋ Tạo yêu cầu mới" disabled={session.status !== 'active' || !session.roomId} onPress={() => navigation.navigate('CreateRepairRequest')} /></YStack></XStack></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 14 }, filters: { flexDirection: 'row', gap: 8 }, list: { padding: 14 }, divider: { borderTopWidth: 0.8, borderTopColor: colors.border }, actions: { flexDirection: 'row', gap: 14 }, action: { flex: 1 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, paddingVertical: 12 } });
