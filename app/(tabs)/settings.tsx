import { AnimatedSwitch } from "@/components/animated-switch";
import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { router, useIsFocused } from "expo-router";
import { Pressable, StatusBar, View } from "react-native";

export default function SettingsPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };
  const isFocused = useIsFocused();

  return (
    <View className="flex-1">
      {isFocused ? (
        <StatusBar barStyle="light-content" />
      ) : (
        <StatusBar barStyle="dark-content" />
      )}
      <View className="bg-ccyan justify-between h-80 rounded-[0_0_35px_35px]">
        <View className="justify-between items-center flex-row p-5 pt-14">
          <Ionicons name="chevron-back" size={32} color="#FFFFFF" onPress={() => {router.back()}}></Ionicons>
          <Text className="text-white text-2xl">Profil</Text>
          <SimpleLineIcons name="pencil" size={22} color="#FFFFFF" />
        </View>
        <View className="justify-center items-center pb-5">
          <View className="bg-[#F2F2F2] h-24 w-24 rounded-full justify-center items-center">
            <Ionicons size={35} color={"#D057A0"} name="person-outline"/>  
          </View>
          <Text className="text-white font-inria-bold top-2 text-2xl">Marko Nenadović</Text>
          <Text className="text-[#BCF6EA] font-inria top-2 text-[14px]">mn20240174@student.fon.bg.ac.rs</Text>
          <Text className="text-[#BCF6EA] font-inria-bold top-2 text-[14px]">+381 65 4546 204</Text>
        </View>
      </View>
      <View className="flex-1 px-5 pt-5 gap-8">
        <View>
          <Text className="font-inria-bold text-2xl text-cgray">
            Bezbednosna podešavanja
          </Text>
          <View className="flex-row justify-between items-center px-4 mt-3">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-200"><Ionicons name="finger-print-outline" size={30} className="text-ctirquise"/></View>
              <Text className="font-inria-regular text-cgray text-2xl">Biometrija</Text>
            </View>
            <AnimatedSwitch></AnimatedSwitch>
          </View>
          <View className="flex-row justify-between items-center px-4 mt-3">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-200"><Ionicons name="key-outline" size={30} className="text-ctirquise"/></View>
              <Text className="font-inria-regular text-cgray text-2xl">Promena PIN-a</Text>
            </View>
            <AnimatedSwitch></AnimatedSwitch>
          </View>
        </View>
        {/* <View>
          <Text className="font-inria-bold text-2xl text-cgray">
            Podešavanja limita
          </Text>
        </View>  */}
        <View>
          <Text className="font-inria-bold text-2xl text-cgray">Obaveštenja</Text>
          <View className="flex-row justify-between items-center px-4 mt-3">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-full justify-center items-center bg-gray-200"><Ionicons name="notifications-outline" size={30} className="text-ctirquise"/></View>
              <Text className="font-inria-regular text-cgray text-2xl">Push notifikacije</Text>
            </View>
            <AnimatedSwitch></AnimatedSwitch>
          </View>
        </View>
        <View className="mt-auto pb-5">
          <Pressable className="bg-red-400 rounded-2xl flex flex-row justify-center items-center mx-auto px-10 py-2 gap-2" onPress={handleLogout}>
            <Ionicons name="log-out-outline" color={"white"} size={30}/><Text className="font-inria-bold text-white">ODJAVI SE</Text>
          </Pressable>
        </View>
      </View>
      {/* <Text className="font-bold text-xl mb-6">Podesavanja stranica</Text>
      <Pressable onPress={handleLogout} className="bg-ccyan rounded-xl px-6 py-4">
        <Text className="text-white font-inria-bold text-base">Izloguj se</Text>
      </Pressable> */}
    </View>
  );
}
