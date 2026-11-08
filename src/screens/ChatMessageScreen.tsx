import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { UnavailableState } from '../components/ui/UnavailableState';
import type { ChatStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatMessage'>;
export function ChatMessageScreen({ navigation }: Props) {
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Tin nhắn" onBack={() => navigation.goBack()} />
    <UnavailableState message="Tin nhắn tạm thời chưa thể sử dụng. Vui lòng thử lại sau." />
  </ScreenContainer>;
}
