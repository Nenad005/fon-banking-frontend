import { useIsFocused } from "@react-navigation/native";
import { Link } from "expo-router";
import { Button, StatusBar, Text, View } from "react-native";

export default function Index() {
  const isFocused = useIsFocused();

  return (
    <View className="flex justify-center items-center pt-20">
      {isFocused ? (
        <StatusBar barStyle="light-content" />
      ) : (
        <StatusBar barStyle="dark-content" />
      )}
      <Text className="font-bold text-xl">PreAktivacija/Login stranica</Text>
      <Link href={"/login"} push asChild>
        <Button title="Uloguj se"></Button>
      </Link>
      <Link href={"/activation"} push asChild>
        <Button title="Aktiviraj nalog"></Button>
      </Link>
    </View>
  );
}
