import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

export default function SettingsPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/')
  };

  return (
    <View className="flex-1 justify-center items-center px-5">
      <Text className="font-bold text-xl mb-6">Podesavanja stranica</Text>
      <Pressable onPress={handleLogout} className="bg-ccyan rounded-xl px-6 py-4">
        <Text className="text-white font-inria-bold text-base">Izloguj se</Text>
      </Pressable>
    </View>
  );
}
