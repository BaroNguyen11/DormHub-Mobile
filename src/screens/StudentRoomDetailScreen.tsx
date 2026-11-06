import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useResidence } from '../context/ResidenceContext';
import { RoomDetailView } from './RoomDetailScreen';
import type { ResidenceStackParamList } from '../types/navigation';
type Props = NativeStackScreenProps<ResidenceStackParamList, 'StudentRoomDetail'>;
export function StudentRoomDetailScreen({ navigation, route }: Props) { const { session } = useResidence(); return <RoomDetailView roomId={route.params.roomId} onBack={() => navigation.goBack()} onApply={() => { if (session.status === 'none') navigation.navigate('RegisterRoom', { roomId: route.params.roomId }); else if (session.status === 'active') navigation.navigate('MyRoom'); else navigation.navigate('RequestStatus'); }} />; }
