import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { YStack } from 'tamagui';

import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { listContracts } from '../api/student';
import type { ContractDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function ContractScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError(undefined);
    listContracts().then((result) => { if (active) setContract(result.data.content.filter((item) => ['ACTIVE', 'PENDING'].includes(item.status) || item.assignmentStatus === 'ASSIGNED').sort((a, b) => Number(new Date(b.startDate)) - Number(new Date(a.startDate)))[0] ?? null); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError ? cause.message : 'Không tải được hợp đồng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hợp đồng thuê phòng" onBack={() => navigation.goBack()} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    {loading ? <ActivityIndicator color={colors.primary} /> : error ? <Text style={styles.empty}>{error}</Text> : !contract ? <Text style={styles.empty}>Chưa có hợp đồng trong tài khoản.</Text> : <>
      <SurfaceCard style={styles.numberCard}><YStack><Text style={styles.label}>Số hợp đồng</Text><Text style={styles.number}>#{contract.contractId}</Text></YStack><Text style={styles.badge}>{contract.status === 'ACTIVE' ? 'Đang hiệu lực' : contract.status}</Text></SurfaceCard>
      <SurfaceCard><DetailRow label="Phòng" value={`${contract.roomNumber} · ${contract.buildingName}`} /><DetailRow label="Ngày bắt đầu" value={new Date(contract.startDate).toLocaleDateString('vi-VN')} /><DetailRow label="Ngày kết thúc" value={new Date(contract.endDate).toLocaleDateString('vi-VN')} /><DetailRow label="Giá phòng / tháng" value={`${Number(contract.monthlyRent).toLocaleString('vi-VN')}đ`} /><DetailRow label="Tiền cọc" value={`${Number(contract.depositAmount).toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
      {contract.description ? <><SectionHeader title="Điều khoản / mô tả" /><Text style={styles.terms}>{contract.description}</Text></> : null}
    </>}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 20 }, numberCard: { minHeight: 76, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, label: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, number: { color: colors.text, fontFamily: typography.bold, fontSize: 17, marginTop: 3 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 }, terms: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 21 }, empty: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, textAlign: 'center', padding: 18 } });
