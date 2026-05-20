import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ActivationPage() {
  return (
    <View className="flex justify-center items-center pt-20">
      {/* <StatusBar barStyle="dark-content" /> */}
      <Text className="font-bold text-xl">Aktivacija stranica</Text>
      <Button
        title="Dalje"
        onPress={() => {
          router.replace("/home");
        }}
      ></Button>
    </View>
  );
}
