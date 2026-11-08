import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { UnavailableState } from '../components/ui/UnavailableState';
import type { ResidenceStackParamList } from '../types/navigation';

export function UtilitiesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Điện & nước" onBack={() => navigation.goBack()} />
    <UnavailableState message="Chỉ số điện, nước tạm thời chưa thể hiển thị. Vui lòng thử lại sau." />
  </ScreenContainer>;
}
