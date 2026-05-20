import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ProductsPage() {
  return (
    <View className="flex justify-center items-center pt-20">
      <Text className="font-bold text-xl">Proizvodi stranica</Text>
      <Link href={"/products/account/1"} asChild>
        <Button title="Dinarski Racun"></Button>
      </Link>
      <Link href={"/products/account/2"} asChild>
        <Button title="Devizni Racun"></Button>
      </Link>
    </View>
  );
}
