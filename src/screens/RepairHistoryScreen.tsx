import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { RepairRequestRow } from '../components/ui/RepairUi';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { colors, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';

export function RepairHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { requests, refreshRepairs, loading, error } = useRepairs();
  useFocusEffect(useCallback(() => { void refreshRepairs().catch(() => undefined); }, [refreshRepairs]));
  const history = requests.filter((item) => item.collection === 'history');
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Lịch sử tạo phiếu" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><SurfaceCard style={styles.card}>{loading ? <TamaText style={styles.empty}>Đang tải...</TamaText> : error ? <YStack style={styles.state}><TamaText style={styles.error}>{error}</TamaText><TamaText onPress={() => void refreshRepairs().catch(() => undefined)} style={styles.retry}>Thử lại</TamaText></YStack> : history.length ? history.map((request, index) => <YStack key={request.id} style={index > 0 && styles.divider}><RepairRequestRow request={request} variant="history" onPress={() => navigation.navigate('RepairRequestDetail', { requestId: request.id })} /></YStack>) : <TamaText style={styles.empty}>Chưa có lịch sử sửa chữa.</TamaText>}</SurfaceCard></ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, card: { padding: 14 }, divider: { borderTopWidth: 0.8, borderTopColor: colors.border }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, state: { gap: 8 }, error: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 } });
