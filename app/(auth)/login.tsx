import PinInput from "@/components/login/pin-input";
import { Text } from "@/components/text";
import Entypo from "@expo/vector-icons/Entypo";
import { Link, router } from "expo-router";
import { Pressable, View } from "react-native";

export default function LoginPage() {
  return (
    <View className="flex-1 pt-14 px-5 pb-7 justify-between">
      <View className="flex-col">
        <View className="gap-20">
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <Entypo name="chevron-left" size={30} className="text-tirquise" />
          </Pressable>
          <Text className="font-inria-bold text-[1.7rem] text-center text-tirquise">
            Ulogujte se u mBanking
          </Text>
        </View>
        <PinInput></PinInput>
      </View>
      <View className="">
        <Link href={"/home"} dismissTo asChild>
          <Pressable className="bg-cyan py-3 rounded-xl">
            <Text className="text-center text-xl text-white font-inria-bold ">
              Dalje
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
