import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { XStack } from 'tamagui';

import { ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { utilityOverview } from '../mocks/residence';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function UtilitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const increase = utilityOverview.electricityKwh - utilityOverview.previousElectricityKwh;
  const max = Math.max(...utilityOverview.electricityHistory.map((entry) => entry.kwh));
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Điện & nước" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <SurfaceCard style={styles.month}><Text style={styles.monthText}>{utilityOverview.month}</Text><Feather name="calendar" size={18} color={colors.textSecondary} /></SurfaceCard>
    <SurfaceCard style={styles.metric}><XStack style={styles.metricHeader}><View style={[styles.iconBox, styles.electricityIcon]}><Feather name="zap" size={23} color="#C67A14" /></View><Text style={styles.metricName}>Điện</Text></XStack><Text style={styles.metricValue}>{utilityOverview.electricityKwh} kWh</Text><Text style={styles.electricityDelta}>↗  +{increase} kWh so với tháng trước ({utilityOverview.previousElectricityKwh} kWh)</Text></SurfaceCard>
    <SurfaceCard style={styles.metric}><XStack style={styles.metricHeader}><View style={[styles.iconBox, styles.waterIcon]}><Feather name="droplet" size={23} color="#2674C6" /></View><Text style={styles.metricName}>Nước</Text></XStack><Text style={styles.metricValue}>{utilityOverview.waterM3} m³</Text><Text style={styles.waterDelta}>−  Không thay đổi so với tháng trước</Text></SurfaceCard>
    <SectionHeader title="Lịch sử 6 tháng – Điện (kWh)" /><SurfaceCard style={styles.chart}><View style={styles.bars}>{utilityOverview.electricityHistory.map((entry, index) => <View key={entry.month} style={styles.barColumn}><View style={[styles.bar, { height: Math.round(entry.kwh / max * 76), backgroundColor: index === utilityOverview.electricityHistory.length - 1 ? colors.primary : colors.fullBackground }]} /><Text style={[styles.barLabel, index === utilityOverview.electricityHistory.length - 1 && styles.activeLabel]}>{entry.month}</Text></View>)}</View></SurfaceCard>
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { padding: 16, gap: 20 }, month: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }, monthText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13.5 }, metric: { minHeight: 142, padding: 18 }, metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 13 }, iconBox: { width: 38, height: 38, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' }, electricityIcon: { backgroundColor: colors.limitedBackground }, waterIcon: { backgroundColor: colors.waterIconBackground }, metricName: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, metricValue: { color: colors.text, fontFamily: typography.regular, fontSize: 25, marginTop: 13 }, electricityDelta: { color: colors.error, fontFamily: typography.semibold, fontSize: 12, marginTop: 8 }, waterDelta: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 12, marginTop: 8 }, chart: { height: 112, marginTop: -8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }, bars: { height: 92, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }, barColumn: { flex: 1, height: 92, justifyContent: 'flex-end', alignItems: 'center' }, bar: { width: '100%', borderRadius: 4 }, barLabel: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11, marginTop: 4 }, activeLabel: { color: colors.text, fontFamily: typography.bold },
});
