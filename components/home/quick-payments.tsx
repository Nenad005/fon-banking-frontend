import { quickPayData } from "@/assets/data/homePageData";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, View } from "react-native";

export default function QuickPayments({
  className = "",
}: {
  className?: string;
}) {
  return (
    <View className={cn("", className)}>
      <Text className="text-cgray text-2xl pb-5">Brza placanja</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-5">
          {quickPayData.map((entry, index) => {
            return (
              <Pressable key={entry.name + index}>
                <View className="flex justify-center">
                  <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                    <Ionicons
                      name={`${entry.icon}-outline`}
                      size={24}
                      className="text-cgray"
                    />
                  </View>
                  <Text className="text-center">{entry.name}</Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable>
            <View className="flex justify-center">
              <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-ccyan">
                <Ionicons name={`add`} size={30} className="text-white" />
              </View>
              <Text className="text-center text-ctirquise">Dodaj</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
