import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack>
      {/* <StatusBar barStyle="dark-content" /> */}
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
