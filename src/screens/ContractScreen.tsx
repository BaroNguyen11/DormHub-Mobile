import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { contractOverview } from '../mocks/residence';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function ContractScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hợp đồng thuê phòng" onBack={() => navigation.goBack()} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <SurfaceCard style={styles.numberCard}><View><Text style={styles.label}>Số hợp đồng</Text><Text style={styles.number}>{contractOverview.number}</Text></View><Text style={styles.badge}>Đang hiệu lực</Text></SurfaceCard>
    <SurfaceCard><DetailRow label="Phòng" value={contractOverview.roomLabel} /><DetailRow label="Ngày bắt đầu" value={contractOverview.startDate} /><DetailRow label="Ngày kết thúc" value={contractOverview.endDate} /><DetailRow label="Giá phòng / tháng" value={`${contractOverview.monthlyPrice.toLocaleString('vi-VN')}đ`} /><DetailRow label="Tiền cọc" value={`${contractOverview.deposit.toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
    <SectionHeader title="Điều khoản chính" /><View style={styles.terms}>{contractOverview.terms.map((term) => <Text key={term} style={styles.term}>· {term}</Text>)}</View>
    <View style={styles.download}><Feather name="download" size={18} color={colors.text} /><Text style={styles.downloadText}>Tải hợp đồng (PDF)</Text></View>
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 20 }, numberCard: { minHeight: 76, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, label: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5 }, number: { color: colors.text, fontFamily: typography.regular, fontSize: 17, marginTop: 3 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, fontFamily: typography.bold, fontSize: 11 }, terms: { gap: 8, marginTop: -4 }, term: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 18 }, download: { height: 48, borderWidth: 0.8, borderColor: colors.primary, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 24 }, downloadText: { color: colors.text, fontFamily: typography.bold, fontSize: 14 },
});
