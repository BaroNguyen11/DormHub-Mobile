import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatMessageScreen } from '../screens/ChatMessageScreen';
import type { ChatStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStack() {
  return <Stack.Navigator initialRouteName="ChatList" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="ChatMessage" component={ChatMessageScreen} />
  </Stack.Navigator>;
}
