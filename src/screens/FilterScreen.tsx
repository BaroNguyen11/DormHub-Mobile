import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { UnavailableState } from '../components/ui/UnavailableState';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'Filter'>;

export function FilterScreen({ navigation }: Props) {
  return <ScreenContainer><UnavailableState message="Hiện chưa thể lọc phòng. Vui lòng thử lại sau." /><Pressable onPress={() => navigation.goBack()} style={{ alignItems: 'center', padding: 20 }}><Text>Quay lại</Text></Pressable></ScreenContainer>;
}
