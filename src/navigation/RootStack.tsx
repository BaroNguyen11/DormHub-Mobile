import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';

import { SplashScreen } from '../screens/SplashScreen';
import type { RootStackParamList } from '../types/navigation';
import { GuestStack } from './GuestStack';
import { StudentTabs } from './StudentTabs';
import { ChatStack } from './ChatStack';
import { useMockAccount } from '../context/MockAccountContext';
import { useAuth } from '../context/AuthContext';
import { devPreviewEnabled } from '../config/devPreview';
import { authDevLog } from '../utils/authDiagnostics';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  const { accountId, postLogoutDestination } = useMockAccount();
  const auth = useAuth();
  const [introComplete, setIntroComplete] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 1100);
    return () => clearTimeout(timer);
  }, []);
  const mode = !introComplete || auth.status === 'loading'
    ? 'splash'
    : auth.status === 'authenticated'
      ? 'student'
      : devPreviewEnabled && accountId
        ? `preview-${accountId}`
        : 'guest';
  useEffect(() => {
    authDevLog(mode.startsWith('preview-')
      ? 'Navigation mode: preview'
      : mode === 'student'
        ? 'Navigation mode: student'
        : mode === 'guest'
          ? 'Navigation mode: guest'
          : 'Navigation mode: splash');
  }, [mode]);
  return (
    <Stack.Navigator key={mode} screenOptions={{ headerShown: false }}>
      {mode === 'splash' ? <Stack.Screen name="Splash" component={SplashScreen} /> : null}
      {mode === 'guest' ? <Stack.Screen name="Guest" component={GuestStack} initialParams={postLogoutDestination === 'PasswordChangeSuccess' ? { screen: 'PasswordChangeSuccess' } : undefined} /> : null}
      {mode === 'student' || mode.startsWith('preview-') ? <Stack.Screen name="Student" component={StudentTabs} /> : null}
      {mode.startsWith('preview-') ? <Stack.Screen name="Chat" component={ChatStack} /> : null}
    </Stack.Navigator>
  );
}
