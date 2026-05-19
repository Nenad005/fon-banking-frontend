import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function AccountDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const nazivi: any = {
    "1": "Dinarski racun",
    "2": "Devizni racun",
  };

  return (
    <View className="flex justify-center items-center pt-20">
      {id ? (
        <Text className="font-bold text-xl">
          Detalji racuna stranica - {nazivi[id]}
        </Text>
      ) : (
        <Text>nece</Text>
      )}
    </View>
  );
}
