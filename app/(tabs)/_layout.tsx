import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
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
    </Tabs>
  );
}
