import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import "../global.css";
import { AuthProvider } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Dangrek-Regular": require("../assets/fonts/Dangrek/Dangrek-Regular.ttf"),
    "IngridDarling-Regular": require("../assets/fonts/Ingrid_Darling/IngridDarling-Regular.ttf"),
    "InriaSans-Light": require("../assets/fonts/Inria_Sans/InriaSans-Light.ttf"),
    "InriaSans-LightItalic": require("../assets/fonts/Inria_Sans/InriaSans-LightItalic.ttf"),
    "InriaSans-Regular": require("../assets/fonts/Inria_Sans/InriaSans-Regular.ttf"),
    "InriaSans-Italic": require("../assets/fonts/Inria_Sans/InriaSans-Italic.ttf"),
    "InriaSans-Bold": require("../assets/fonts/Inria_Sans/InriaSans-Bold.ttf"),
    "InriaSans-BoldItalic": require("../assets/fonts/Inria_Sans/InriaSans-BoldItalic.ttf"),
    "Inter-Variable": require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
    "Inter-VariableItalic": require("../assets/fonts/Inter/Inter-Italic-VariableFont_opsz,wght.ttf"),
    "Inconsolata-Regular": require("../assets/fonts/Inconsolata/Inconsolata-VariableFont_wdth,wght.ttf"),
    "Inconsolata-ExtraBold": require("../assets/fonts/Inconsolata/Inconsolata-ExtraBold.ttf"),
  });

  cssInterop(Entypo, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
  });
  cssInterop(FontAwesome, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
  });
  cssInterop(Ionicons, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
  });
  cssInterop(MaterialIcons, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
  });
  cssInterop(Feather, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
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
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "FON Banka", headerShown: false }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: "Uloguj se",
            animation: "slide_from_right",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/activation"
          options={{ title: "Aktiviraj se" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
