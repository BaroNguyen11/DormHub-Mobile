import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { InvoiceListScreen } from '../screens/InvoiceListScreen';
import { PaymentHistoryScreen } from '../screens/PaymentHistoryScreen';
import { PaymentProcessingScreen } from '../screens/PaymentProcessingScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import type { InvoiceStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<InvoiceStackParamList>();
export function InvoiceStack() { return <Stack.Navigator initialRouteName="InvoiceList" screenOptions={{ headerShown: false }}><Stack.Screen name="InvoiceList" component={InvoiceListScreen} /><Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} /><Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} options={{ gestureEnabled: false }} /><Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ gestureEnabled: false }} /><Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} /></Stack.Navigator>; }
