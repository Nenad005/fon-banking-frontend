import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Alert, Pressable, Text, View } from "react-native";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <AuthProvider>
            <GlobalWipeButton />
            <RootNavigator />
          </AuthProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function GlobalWipeButton() {
  const { clearSecureStore } = useAuth();
  const segments = useSegments();

  if (String(segments[0]) === "qr-scanner") {
    return null;
  }

  const handleDataClear = () => {
    Alert.alert(
      "Obriši sve podatke?",
      "Ovo će obrisati device ID i PIN setup iz SecureStore-a i vratiti aplikaciju na aktivaciju.",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: () => {
            void clearSecureStore();
          },
        },
      ],
    );
  };

  return (
    <View className="absolute right-4 bottom-20 z-50">
      <Pressable
        onPress={handleDataClear}
        className="bg-red-600 rounded-full px-4 py-3 shadow-lg"
      >
        <Text className="text-white font-inria-bold text-xs tracking-wider">
          DATA CLEAR
        </Text>
      </Pressable>
    </View>
  );
}

function RootNavigator() {
  const { authStatus } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  console.log(segments);
  const currentGroup = segments[0];
  const currentScreen = segments[1];
  const isLandingScreen = !currentGroup;

  useEffect(() => {
    if (
      authStatus === "pending_activation" &&
      !isLandingScreen &&
      currentScreen !== "activation"
    ) {
      router.push("/activation");
      return;
    }

    if (
      authStatus === "pending_pin" &&
      !isLandingScreen &&
      currentScreen !== "pin-setup"
    ) {
      router.push("/pin-setup");
      return;
    }

    if (
      authStatus === "pending_session" &&
      !isLandingScreen &&
      currentScreen !== "login"
    ) {
      if (currentGroup === "(tabs)") {
        router.replace("/");
      } else {
        router.push("/login");
      }
      return;
    }

    if (authStatus === "authenticated" && currentGroup === "(auth)") {
      router.replace("/home");
    }
  }, [authStatus, currentGroup, currentScreen, router]);

  if (authStatus === "loading") {
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
        options={{
          title: "Uloguj se",
          animation: "slide_from_right",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)/activation"
        options={{ title: "Aktiviraj se", headerShown: false }}
      />
      <Stack.Screen
        name="(auth)/pin-setup"
        options={{ title: "Postavi PIN", headerShown: false }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="qr-scanner"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
    </Stack>
  );
}
