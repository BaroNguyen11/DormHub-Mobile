import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useResidence } from '../context/ResidenceContext';
import type { ResidenceStackParamList } from '../types/navigation';
import { RoomDetailView } from './RoomDetailScreen';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'StudentRoomDetail'>;
export function StudentRoomDetailScreen({ navigation, route }: Props) {
  const { session } = useResidence();
  const canApplyByState = session.status === 'none' || session.status === 'rejected';
  return <RoomDetailView roomId={route.params.roomId} canApplyByState={canApplyByState}
    onBack={() => navigation.goBack()}
    onApply={() => navigation.navigate('RegisterRoom', { roomId: route.params.roomId })}
    onStatus={() => navigation.navigate(session.status === 'active' ? 'MyRoom' : 'RequestStatus')} />;
}
