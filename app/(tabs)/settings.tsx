import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function SettingsPage() {
  return (
    <View className="flex justify-center items-center pt-20">
      <Text className="font-bold text-xl">Podesavanja stranica</Text>
      <Link href={"/"} dismissTo asChild>
        <Button title="Izloguj se"></Button>
      </Link>
    </View>
  );
}
