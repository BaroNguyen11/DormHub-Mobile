import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { SplashScreen } from '../screens/SplashScreen';
import type { RootStackParamList } from '../types/navigation';
import { GuestStack } from './GuestStack';
import { StudentTabs } from './StudentTabs';
import { useAuth } from '../context/AuthContext';
import { authDevLog } from '../utils/authDiagnostics';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  const auth = useAuth();
  const [introComplete, setIntroComplete] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 1100);
    return () => clearTimeout(timer);
  }, []);
  const mode = !introComplete || auth.status === 'loading'
    ? 'splash'
    : auth.status === 'authenticated' ? 'student' : 'guest';
  useEffect(() => {
    authDevLog(mode === 'student'
        ? 'Navigation mode: student'
        : mode === 'guest'
          ? 'Navigation mode: guest'
          : 'Navigation mode: splash');
  }, [mode]);
  return (
    <Stack.Navigator key={mode} screenOptions={{ headerShown: false }}>
      {mode === 'splash' ? <Stack.Screen name="Splash" component={SplashScreen} /> : null}
      {mode === 'guest' ? <Stack.Screen name="Guest" component={GuestStack} /> : null}
      {mode === 'student' ? <Stack.Screen name="Student" component={StudentTabs} /> : null}
    </Stack.Navigator>
  );
}
