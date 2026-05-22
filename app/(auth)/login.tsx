import PinInput from "@/components/login/pin-input";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function LoginPage() {
  const [code, setCode] = useState<string>("");
  const [isCodeReady, setIsCodeReady] = useState(false);

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
        <PinInput
          code={code}
          setCode={setCode}
          isCodeReady={isCodeReady}
          setIsCodeReady={setIsCodeReady}
        ></PinInput>
      </View>
      <View className="">
        <Link href={"/home"} dismissTo asChild>
          <Pressable
            className={cn(
              "bg-cyan py-3 rounded-xl",
              !isCodeReady && "bg-cyan/50",
            )}
            disabled={!isCodeReady}
          >
            <Text className="text-center text-xl text-white font-inria-bold ">
              Dalje
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
