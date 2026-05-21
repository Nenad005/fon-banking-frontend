import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Dangrek-Regular": require("../assets/fonts/Dangrek/Dangrek-Regular.ttf"),
    "IngridDarling-Regular": require("../assets/fonts/Ingrid_Darling/IngridDarling-Regular.ttf"),
    "InriaSans-Regular": require("../assets/fonts/Inria_Sans/InriaSans-Regular.ttf"),
    "Inter-Variable": require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
    "Inter-VariableItalic": require("../assets/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf"),
    Inconsolata: require("../assets/fonts/Inconsolata/Inconsolata-VariableFont_wdth,wght.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "FON Banka", headerShown: false }}
      />
      <Stack.Screen
        name="(auth)/login"
        options={{ title: "Uloguj se", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="(auth)/activation"
        options={{ title: "Aktiviraj se" }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
