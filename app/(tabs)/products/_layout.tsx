import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animationMatchesGesture: true,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Proizvodi",
          animation: "none",
        }}
      />
      <Stack.Screen
        name="account/[id]"
        options={{
          title: "Detalji računa",
        }}
      />
      <Stack.Screen
        name="card/[id]"
        options={{
          title: "Detalji kartice",
        }}
      />
    </Stack>
  );
}
