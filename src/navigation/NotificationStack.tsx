import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { NotificationDetailScreen } from '../screens/NotificationDetailScreen';
import type { NotificationStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<NotificationStackParamList>();

export function NotificationStack() {
  return <Stack.Navigator initialRouteName="NotificationCenter" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
    <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
  </Stack.Navigator>;
}
