import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { PlatformPressable } from "expo-router/react-navigation";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#004B7C",
        tabBarInactiveTintColor: "#505050",
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => (
          <PlatformPressable {...props} android_ripple={{ color: "#f1f1f1" }} />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Početna",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Proizvodi",
          popToTopOnBlur: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Plaćanja",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="payments" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transakcije",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Podešavanja",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
