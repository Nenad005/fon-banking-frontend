import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, RelativePathString, useIsFocused } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import colors from "tailwindcss/colors";
import { Text } from "../components/text";
import { useAuth } from "@/context/AuthContext";

cssInterop(LinearGradient, {
  className: "style",
});

export default function Index() {
  const isFocused = useIsFocused();
  const { authStatus } = useAuth();

  const primaryAction = (() => {
    switch (authStatus) {
      case "pending_activation":
        return { href: "/activation", label: "Aktiviraj nalog" };
      case "pending_pin":
        return { href: "/pin-setup", label: "Postavi PIN" };
      case "pending_session":
        return { href: "/login", label: "Uloguj se" };
      case "authenticated":
        return { href: "/home", label: "Uđi u aplikaciju" };
      default:
        return { href: "/login", label: "Uloguj se" };
    }
  })();

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
              <Text className="text-white text-5xl font-dangrek">
                FON <Text className="text-4xl font-darling">banka</Text>
              </Text>
            </View>
            <Text className="text-white underline underline-offset-8">RS</Text>
          </View>
          <View className="flex gap-0">
            <Text className="text-white text-[2rem]">Mobilno bankarstvo</Text>
            <Text className="text-white text-[1rem] font-inria-light">
              Vise vremena za ucenja, manje stresa
            </Text>
          </View>
        </View>
        <View id="bottom" className="flex gap-4">
          <Link href={primaryAction.href as RelativePathString} push asChild className="bg-white rounded-lg">
            <Pressable className="w-full py-3">
              <Text className="text-center text-xl font-inria-bold ">
                {primaryAction.label}
              </Text>
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
    </View>
  );
}
