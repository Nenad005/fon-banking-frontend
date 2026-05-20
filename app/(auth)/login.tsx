import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function LoginPage() {
  return (
    <View className="flex justify-center items-center pt-20">
      {/* <StatusBar barStyle="dark-content" /> */}
      <Text className="font-bold text-xl">Login stranica</Text>
      <Link href={"/home"} dismissTo asChild>
        <Button title="Dalje"></Button>
      </Link>
    </View>
  );
}
