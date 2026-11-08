import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";

import { RootStack } from "./src/navigation/RootStack";
import { ResidenceProvider } from "./src/context/ResidenceContext";
import { InvoiceProvider } from "./src/context/InvoiceContext";
import { RepairProvider } from "./src/context/RepairContext";
import { MockAccountProvider } from "./src/context/MockAccountContext";
import { ChatProvider } from "./src/context/ChatContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { tamaguiConfig } from "./tamagui.config";
import { AuthPocPanel } from "./src/components/dev/AuthPocPanel";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular: require("@expo-google-fonts/roboto/400Regular/Roboto_400Regular.ttf"),
    Roboto_600SemiBold: require("@expo-google-fonts/roboto/600SemiBold/Roboto_600SemiBold.ttf"),
    Roboto_700Bold: require("@expo-google-fonts/roboto/700Bold/Roboto_700Bold.ttf"),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <SafeAreaProvider>
        <ResidenceProvider>
          <InvoiceProvider>
            <RepairProvider>
              <NotificationProvider>
                <MockAccountProvider>
                  <ChatProvider>
                    <AuthProvider>
                      <NavigationContainer>
                        <RootStack />
                      </NavigationContainer>
                      {__DEV__ ? <AuthPocPanel /> : null}
                    </AuthProvider>
                  </ChatProvider>
                </MockAccountProvider>
              </NotificationProvider>
            </RepairProvider>
          </InvoiceProvider>
        </ResidenceProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
