import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex justify-center items-center pt-20">
      <Text className="font-bold text-xl">Ovo je prva stranica</Text>
      <Link href="/druga" push asChild>
        <Pressable className="text-blue-500 underline">
          <Text>Idi na drugu stranicu</Text>
        </Pressable>
      </Link>
    </View>
  );
}
