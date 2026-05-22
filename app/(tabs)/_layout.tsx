import { cn } from "@/lib/utils";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
            <FontAwesome
              name="home"
              size={24}
              className={cn(focused ? "text-tirquise" : "text-cgray")}
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
            <Entypo
              name="wallet"
              size={24}
              className={cn(focused ? "text-tirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Placanja",
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="payments"
              size={24}
              color="black"
              className={cn(focused ? "text-tirquise" : "text-cgray")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transakcije",
          tabBarIcon: ({ focused }) => (
            <Entypo
              name="bar-graph"
              size={20}
              color="black"
              className={cn(focused ? "text-tirquise" : "text-cgray")}
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
              name="settings"
              size={24}
              color="black"
              className={cn(focused ? "text-tirquise" : "text-cgray")}
            />
          ),
        }}
      />
    </Tabs>
  );
}
