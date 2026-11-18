import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { changeRequestedRoom } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { useResidence } from '../context/ResidenceContext';
import { RoomDetailView } from './RoomDetailScreen';
import type { ResidenceStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ResidenceStackParamList, 'StudentRoomDetail'>;
export function StudentRoomDetailScreen({ navigation, route }: Props) {
  const { session, application, refreshResidence } = useResidence();
  const changingApplicationRoom = session.status === 'pending' && typeof application?.id === 'number';
  const selectRoom = async () => {
    if (changingApplicationRoom && typeof application?.id === 'number') {
      try {
        await changeRequestedRoom(application.id, route.params.roomId);
        await refreshResidence();
        navigation.navigate('RequestStatus');
      } catch (cause) {
        Alert.alert('Không đổi được phòng', cause instanceof ApiError ? cause.message : 'Vui lòng thử lại.');
      }
      return;
    }
    if (session.status === 'none' || session.status === 'rejected') navigation.navigate('RegisterRoom', { roomId: route.params.roomId });
    else if (session.status === 'active') navigation.navigate('MyRoom');
    else navigation.navigate('RequestStatus');
  };
  return <RoomDetailView roomId={route.params.roomId} student onBack={() => navigation.goBack()} onApply={() => void selectRoom()} actionTitle={changingApplicationRoom ? 'Chọn phòng này' : 'Đăng ký thuê phòng'} />;
}
