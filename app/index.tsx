import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex justify-center items-center pt-20">
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
