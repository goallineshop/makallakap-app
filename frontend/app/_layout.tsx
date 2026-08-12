import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { UserDataProvider } from "@/src/context/UserDataContext";
import { ToastProvider } from "@/src/components/Toast";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="proverb/[id]" />
      <Stack.Screen name="category/[key]" />
      <Stack.Screen name="quiz/play" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="recent" />
      <Stack.Screen name="achievements" />
      <Stack.Screen name="flashcards" />
    </Stack>
  );
}

export default function RootLayout() {
  const [iconsLoaded, iconsError] = useIconFonts();
  const [fontsLoaded, fontsError] = useFonts({
    Cormorant: require("../assets/fonts/CormorantGaramond-Regular.ttf"),
    "Cormorant-Medium": require("../assets/fonts/CormorantGaramond-Medium.ttf"),
    "Cormorant-SemiBold": require("../assets/fonts/CormorantGaramond-SemiBold.ttf"),
    "Cormorant-Bold": require("../assets/fonts/CormorantGaramond-Bold.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
  });

  const iconsReady = iconsLoaded || iconsError;
  const fontsReady = fontsLoaded || fontsError;

  useEffect(() => {
    if (iconsReady && fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [iconsReady, fontsReady]);

  if (!iconsReady || !fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <UserDataProvider>
            <ToastProvider>
              <ThemedStatusBar />
              <ThemedStack />
            </ToastProvider>
          </UserDataProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
