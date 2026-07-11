import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, useSegments } from "expo-router";

export default function TabsLayout() {
  const segments = useSegments();

  // const isNestedProductScreen =
  // segments.includes("account") || segments.includes("card");

  return (
    <Tabs
      screenOptions={{
        headerTitleContainerStyle: { padding: 0 },
        tabBarActiveTintColor: "#004B7C",
        tabBarInactiveTintColor: "#505050",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Pocetna",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home-outline"
              size={24}
              className={cn(focused ? "text-ctirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Proizvodi",
          // headerShown: isNestedProductScreen ? false : true,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="wallet-outline"
              size={24}
              className={cn(focused ? "text-ctirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Placanja",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="payments"
              size={24}
              color="black"
              className={cn(focused ? "text-ctirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transakcije",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color="black"
              className={cn(focused ? "text-ctirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Podesavanja",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              className={cn(focused ? "text-ctirquise" : "text-cgray")}
            />
          ),
        }}
      />
    </Tabs>
  );
}
