import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex justify-center items-center pt-20">
      <Text className="font-bold text-xl">Ovo je druga stranica</Text>
      <Button
        title="Push druga"
        onPress={() => {
          router.push("/druga");
        }}
      ></Button>
    </View>
  );
}
