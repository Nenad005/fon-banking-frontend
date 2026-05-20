import Entypo from "@expo/vector-icons/Entypo";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import colors from "tailwindcss/colors";

cssInterop(LinearGradient, {
  className: "style",
});

export default function Index() {
  const isFocused = useIsFocused();

  return (
    <View className="flex-1 relative bg-green-200">
      {isFocused ? (
        <StatusBar barStyle="light-content" />
      ) : (
        <StatusBar barStyle="dark-content" />
      )}
      <View id="image" style={StyleSheet.absoluteFill}>
        <Image
          source={require("../assets/images/fon-nova-zgrada.png")}
          style={{ width: "100%", height: "100%", backgroundColor: "blue" }}
          contentFit="cover"
        />
      </View>
      <View
        id="gradients"
        className="absolute inset-0 flex flex-col h-full justify-between"
      >
        <LinearGradient
          colors={[colors.black, colors.transparent]}
          start={{ x: 0.5, y: 0.09 }}
          // end={{ x: 0.5, y: 0.5 }}
          className="h-[50%] w-full"
        />
        <LinearGradient
          colors={[colors.transparent, colors.black]}
          end={{ x: 0.5, y: 0.9 }}
          className="h-[50%] w-full"
        />
      </View>
      <View id="content" className="flex-1 pt-14 px-5 pb-12 justify-between">
        {/* <Text className="text-white">Ovo je naslov</Text> */}
        <View id="top" className="flex gap-3">
          <View className="flex flex-row justify-between">
            <View className="flex flex-row items-center gap-4">
              <Image
                source={require("../assets/images/FON-Logo.svg")}
                style={{ width: 40, height: 40 }}
              ></Image>
              <Text className="text-white text-4xl">
                FON <Text className="text-3xl">banka</Text>
              </Text>
            </View>
            <Text className="text-white underline underline-offset-8">RS</Text>
          </View>
          <View className="flex gap-0">
            <Text className="text-white text-3xl">Mobilno bankarstvo</Text>
            <Text className="text-white text-base font-thin">
              Vise vremena za ucenja, manje stresa
            </Text>
          </View>
        </View>
        <View id="bottom" className="flex gap-4">
          <Link href={"/login"} push asChild className="bg-white rounded-lg">
            <Pressable className="w-full py-3">
              <Text className="text-center text-xl">Uloguj se</Text>
            </Pressable>
          </Link>
          <View className="flex justify-between flex-row">
            <View className="flex flex-row items-center">
              <Text className="text-white font-normal text-base">
                TRANSAKCIJE
              </Text>
              <Entypo name="chevron-right" size={24} color="white" />
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-white font-normal text-base">SKENIRAJ</Text>
              <Entypo name="chevron-right" size={24} color="white" />
            </View>
            <View className="flex flex-row items-center">
              <Text className="text-white font-normal text-base">RACUNI</Text>
              <Entypo name="chevron-right" size={24} color="white" />
            </View>
          </View>
        </View>
      </View>
      {/* <Text className="font-bold text-xl">PreAktivacija/Login stranica</Text> */}
      {/* <Link href={"/login"} push asChild>
        <Button title="Uloguj se"></Button>
      </Link>
      <Link href={"/activation"} push asChild>
        <Button title="Aktiviraj nalog"></Button>
      </Link> */}
    </View>
  );
}
