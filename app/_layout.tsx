import { Colors } from "@/constants/Colors";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const isSignedIn = true;

  useEffect(() => {
    const inTabsGroup = segments[0] === "(tabs)";
    const inRunningScreen = segments[0] === "running";

    if (isSignedIn && !inTabsGroup && !inRunningScreen) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && inTabsGroup) {
      router.replace("/welcome");
    }
  }, [isSignedIn, segments, router]);

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.black,
      card: Colors.dark.card,
      text: Colors.dark.text,
      primary: Colors.dark.primary,
    },
  };

  return (
    <ThemeProvider value={CustomDarkTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.dark.black }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth" options={{ title: "Sign Up / Log In" }} />
          <Stack.Screen name="goal" options={{ title: "Set Your Goal" }} />
          <Stack.Screen name="running" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </View>
    </ThemeProvider>
  );
}
