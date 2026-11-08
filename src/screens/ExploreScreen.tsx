import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { GuestBottomBar } from '../components/ui/GuestBottomBar';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Explore'>;
export function ExploreScreen({ navigation }: Props) {
  return <ScreenContainer><StatusBar style="dark" />
    <View style={styles.content}>
      <Text style={styles.title}>Khám phá phòng</Text>
      <Text style={styles.message}>Đăng nhập bằng tài khoản sinh viên để xem phòng và gửi đơn đăng ký.</Text>
      <AppButton title="Đăng nhập" onPress={() => navigation.navigate('Login')} />
    </View>
    <GuestBottomBar onExplorePress={() => undefined} onAccountPress={() => navigation.navigate('Login')} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 20, textAlign: 'center' },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14, textAlign: 'center' },
});
