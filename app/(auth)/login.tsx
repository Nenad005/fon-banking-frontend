import PinInput from "@/components/login/pin-input";
import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

export default function LoginPage() {
  const { login } = useAuth();
  const [code, setCode] = useState<string>("");
  const [isCodeReady, setIsCodeReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!isCodeReady || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const isAuthenticated = await login(code);

      if (isAuthenticated) {
        router.replace("/home");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Prijava nije uspela.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 pt-14 px-5 pb-7 justify-between">
      <View className="flex-col">
        <View className="gap-20">
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <Entypo name="chevron-left" size={30} className="text-ctirquise" />
          </Pressable>
          <Text className="font-inria-bold text-[1.7rem] text-center text-ctirquise">
            Ulogujte se u mBanking
          </Text>
        </View>
        <PinInput
          code={code}
          setCode={setCode}
          isCodeReady={isCodeReady}
          setIsCodeReady={setIsCodeReady}
        />
        {errorMessage ? (
          <Text className="text-red-600 font-inria-regular text-center mt-4">
            {errorMessage}
          </Text>
        ) : null}
      </View>
      <View className="">
        <Pressable
          onPress={handleLogin}
          disabled={!isCodeReady || isSubmitting}
          className={cn(
            "bg-ccyan py-3 rounded-xl items-center",
            (!isCodeReady || isSubmitting) && "bg-ccyan/50",
          )}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-xl text-white font-inria-bold ">
              Uloguj se
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
