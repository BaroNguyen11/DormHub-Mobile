import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { YStack } from 'tamagui';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function UtilitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Điện & nước" onBack={() => navigation.goBack()} /><YStack style={styles.content}><SurfaceCard style={styles.card}><Text style={styles.title}>Chưa có số liệu sử dụng</Text><Text style={styles.body}>Backend hiện chưa cung cấp API chỉ số điện và nước theo phòng. Màn hình sẽ hiển thị số liệu tại đây khi API được bổ sung.</Text></SurfaceCard></YStack></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16 }, card: { padding: 18, gap: 8 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, body: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 20 } });
