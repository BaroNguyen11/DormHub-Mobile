import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen } from '../screens/SplashScreen';
import type { RootStackParamList } from '../types/navigation';
import { GuestStack } from './GuestStack';
import { StudentTabs } from './StudentTabs';
import { ChatStack } from './ChatStack';
import { useMockAccount } from '../context/MockAccountContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  const { isAuthenticated } = useMockAccount();
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Guest" component={GuestStack} />
      <Stack.Screen name="Student" component={StudentTabs} />
      {isAuthenticated ? <Stack.Screen name="Chat" component={ChatStack} /> : null}
    </Stack.Navigator>
  );
}
