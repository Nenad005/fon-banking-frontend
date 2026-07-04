import PinInput from "@/components/login/pin-input";
import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

export default function PinSetupPage() {
  const { setupPin } = useAuth();
  const [code, setCode] = useState("");
  const [isCodeReady, setIsCodeReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSetupPin = async () => {
    if (!isCodeReady || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await setupPin(code);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Postavljanje PIN-a nije uspelo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-between px-5 pt-16 pb-8 bg-white">
      <View className="gap-6">
        <View className="gap-2">
          <Text className="font-inria-bold text-3xl text-cblue">
            Postavite PIN
          </Text>
          <Text className="font-inria-light text-cgray text-base">
            Kreirajte četvorocifreni PIN za brzu prijavu na uređaju.
          </Text>
        </View>

        <PinInput
          code={code}
          setCode={setCode}
          isCodeReady={isCodeReady}
          setIsCodeReady={setIsCodeReady}
        />

        {errorMessage ? (
          <Text className="text-red-600 font-inria-regular">{errorMessage}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleSetupPin}
        disabled={!isCodeReady || isSubmitting}
        className={`rounded-xl py-4 items-center ${
          !isCodeReady || isSubmitting ? "bg-ccyan/50" : "bg-ccyan"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-inria-bold text-lg">Sačuvaj PIN</Text>
        )}
      </Pressable>
    </View>
  );
}
