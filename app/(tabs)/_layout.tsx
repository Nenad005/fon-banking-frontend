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
    <Tabs screenOptions={{ headerTitleContainerStyle: { padding: 0 } }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Pocetna",
          tabBarIcon: () => <FontAwesome name="home" size={24} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Proizvodi",
          // headerShown: isNestedProductScreen ? false : true,
          headerShown: false,
          tabBarIcon: () => <Entypo name="wallet" size={24} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Placanja",
          tabBarIcon: () => (
            <MaterialIcons name="payments" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transakcije",
          tabBarIcon: () => <Entypo name="bar-graph" size={20} color="black" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Podesavanja",
          tabBarIcon: () => (
            <Ionicons name="settings" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
