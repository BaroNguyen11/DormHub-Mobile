import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getStudentContract, getStudentContracts } from '../api/contracts';
import type { StudentContractDto } from '../api/contracts';
import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { useResidence } from '../context/ResidenceContext';
import { contractOverview } from '../mocks/residence';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

type Navigation = NativeStackNavigationProp<ResidenceStackParamList>;
const formatDate = (value: string) => {
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};
const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export function ContractScreen() {
  const navigation = useNavigation<Navigation>();
  const { session } = useResidence();
  const { isAuthenticated, accountId } = useMockAccount();
  const isBackendAccount = isAuthenticated && accountId === null;
  const [contracts, setContracts] = useState<readonly StudentContractDto[]>([]);
  const [selectedContract, setSelectedContract] = useState<StudentContractDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectContract = useCallback(async (contractId: number) => {
    setLoading(true);
    setError(null);
    try {
      setSelectedContract(await getStudentContract(contractId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được chi tiết hợp đồng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isBackendAccount) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    void getStudentContracts(0, 20).then(async (page) => {
      if (!mounted) return;
      setContracts(page.content);
      const initial = page.content.find((item) => item.contractId === session.backendContractId) ?? page.content[0];
      if (!initial) { setSelectedContract(null); return; }
      setSelectedContract(await getStudentContract(initial.contractId));
    }).catch((loadError: unknown) => {
      if (mounted) setError(loadError instanceof Error ? loadError.message : 'Không tải được hợp đồng.');
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [isBackendAccount, session.backendContractId]);

  if (isBackendAccount) return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hợp đồng" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {loading ? <Text style={styles.message}>Đang tải hợp đồng...</Text> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {!loading && !error && contracts.length === 0 ? <Text style={styles.message}>Chưa có hợp đồng.</Text> : null}
    {contracts.length > 1 ? <><SectionHeader title="Danh sách hợp đồng" /><View style={styles.contractList}>{contracts.map((item) => <Pressable key={item.contractId} onPress={() => void selectContract(item.contractId)} style={[styles.contractItem, selectedContract?.contractId === item.contractId && styles.selectedContract]}><View style={styles.contractItemCopy}><Text style={styles.contractItemTitle}>Hợp đồng #{item.contractId}</Text><Text style={styles.contractItemMeta}>ID phòng {item.roomId} · {item.status}</Text></View><Feather name="chevron-right" size={18} color={colors.inactiveTab} /></Pressable>)}</View></> : null}
    {selectedContract ? <><SurfaceCard style={styles.statusCard}><View><Text style={styles.label}>Mã hợp đồng</Text><Text style={styles.number}>#{selectedContract.contractId}</Text></View><Text style={styles.badge}>{selectedContract.status}</Text></SurfaceCard><SurfaceCard><DetailRow label="ID phòng" value={String(selectedContract.roomId)} /><DetailRow label="Ngày bắt đầu" value={formatDate(selectedContract.startDate)} /><DetailRow label="Ngày kết thúc" value={formatDate(selectedContract.endDate)} /><DetailRow label="Giá thuê hàng tháng" value={formatMoney(selectedContract.monthlyRent)} /><DetailRow label="Tiền cọc" value={formatMoney(selectedContract.depositAmount)} last /></SurfaceCard>{selectedContract.description ? <><SectionHeader title="Mô tả" /><Text style={styles.description}>{selectedContract.description}</Text></> : null}<Text style={styles.backendNote}>Thông tin hiển thị theo dữ liệu hợp đồng hiện có. API chưa trả số phòng, tên tòa hoặc tài liệu hợp đồng.</Text></> : null}
  </ScrollView></ScreenContainer>;

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hợp đồng thuê phòng" onBack={() => navigation.goBack()} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <SurfaceCard style={styles.statusCard}><View><Text style={styles.label}>Số hợp đồng</Text><Text style={styles.number}>{contractOverview.number}</Text></View><Text style={styles.badge}>Đang hiệu lực</Text></SurfaceCard>
    <SurfaceCard><DetailRow label="Phòng" value={contractOverview.roomLabel} /><DetailRow label="Ngày bắt đầu" value={contractOverview.startDate} /><DetailRow label="Ngày kết thúc" value={contractOverview.endDate} /><DetailRow label="Giá phòng / tháng" value={`${contractOverview.monthlyPrice.toLocaleString('vi-VN')}đ`} /><DetailRow label="Tiền cọc" value={`${contractOverview.deposit.toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
    <SectionHeader title="Điều khoản chính" /><View style={styles.terms}>{contractOverview.terms.map((term) => <Text key={term} style={styles.term}>· {term}</Text>)}</View>
    <View style={styles.download}><Feather name="download" size={18} color={colors.text} /><Text style={styles.downloadText}>Tải hợp đồng (PDF)</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, gap: 16 }, statusCard: { minHeight: 76, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, label: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, number: { color: colors.text, fontFamily: typography.regular, fontSize: 17, marginTop: 3 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 }, terms: { gap: 8, marginTop: -4 }, term: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, download: { height: 48, borderWidth: 0.8, borderColor: colors.primary, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 24 }, downloadText: { color: colors.text, fontFamily: typography.bold, fontSize: 14 }, message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, paddingVertical: 8 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 }, description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 }, backendNote: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 17 }, contractList: { gap: 8 }, contractItem: { backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }, selectedContract: { borderColor: colors.primary }, contractItemCopy: { flex: 1 }, contractItemTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13 }, contractItemMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11.5, marginTop: 3 } });
