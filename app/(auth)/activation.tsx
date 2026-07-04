import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from "react-native";

export default function ActivationPage() {
  const { activateAccount } = useAuth();
  const [activationCode, setActivationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!activationCode.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await activateAccount(activationCode.trim());

      if (response.user_status === "pending_pin") {
        return;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Aktivacija nije uspela.",
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
            Aktivacija naloga
          </Text>
          <Text className="font-inria-light text-cgray text-base">
            Unesite aktivacioni kod koji ste dobili za registraciju uređaja.
          </Text>
        </View>

        <View className="gap-3">
          <Text className="font-inria-bold text-cblue">Aktivacioni kod</Text>
          <TextInput
            value={activationCode}
            onChangeText={setActivationCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Unesite kod"
            className="border border-cgray/30 rounded-xl px-4 py-4 font-inria-regular text-base"
          />
        </View>

        {errorMessage ? (
          <Text className="text-red-600 font-inria-regular">{errorMessage}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleActivate}
        disabled={!activationCode.trim() || isSubmitting}
        className={`rounded-xl py-4 items-center ${
          !activationCode.trim() || isSubmitting ? "bg-ccyan/50" : "bg-ccyan"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-inria-bold text-lg">Nastavi</Text>
        )}
      </Pressable>
    </View>
  );
}
