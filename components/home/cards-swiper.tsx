import { Account } from "@/app/(tabs)/home";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, ScrollView, View } from "react-native";

export default function CardsSwiper({
  accountsData,
}: {
  accountsData: Account[];
}) {
  const colorClassNames: Record<string, Record<string, string>> = {
    magenta: {
      background: "bg-cmagenta/90",
      icon: "text-[#E58EC3]",
    },
    tirquise: {
      background: "bg-ctirquise/80",
      icon: "text-ctirquise",
    },
  };

  return (
    <ScrollView // PRIKAZ RACUNA
      className="bg-gren-200 max-h-60 min-h-60 border-0 overflow-visible"
      horizontal={true}
      snapToEnd={true}
      showsHorizontalScrollIndicator={false}
    >
      <FlatList
        className="flex-row gap-5 px-5"
        data={accountsData}
        renderItem={({ item: account, index }) => {
          const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const formattedBalance = formatter.format(account.balance);
          let formattedId = "";
          let dash = false;
          let didigts = 0;
          for (let i = 0; i < account.accountId.length; i++) {
            if (dash) {
              if (didigts % 4 === 0) {
                formattedId += " ";
              }
              formattedId += account.accountId[i];
              didigts++;
            } else {
              if (account.accountId[i] === "-") {
                dash = true;
              } else formattedId += account.accountId[i];
            }
          }

          return (
            <View
              key={account.accountId}
              className={cn(
                "p-4 rounded-3xl justify-between aspect-[1.6] overflow-hidden",
                colorClassNames[account.color].background,
              )}
            >
              <View className="absolute bottom-[-10px] right-[-30px] rotate-[20deg]">
                <FontAwesome
                  name="bank"
                  size={120}
                  className={colorClassNames[account.color].icon}
                />
              </View>
              <View className="flex-row justify-between">
                <Text className="text-white uppercase text-xl">
                  {account.title}
                </Text>
                <MaterialIcons name="more-vert" size={24} color="white" />
              </View>
              <View>
                <Text className="text-white text-lg">
                  Ukupno raspolozivo stanje
                </Text>
                <View className="flex-row items-end gap-2">
                  <Text className="text-cyellow text-5xl font-inconsolata-extrabold">
                    {formattedBalance}
                  </Text>
                  <Text className="text-cyellow text-2xl font-inria-bold">
                    {account.currency}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-end gap-3">
                <Text className="text-white font-lg">{formattedId}</Text>
                <View className="h-fit pb-1">
                  <Feather name="copy" size={18} color="white" />
                </View>
              </View>
            </View>
          );
        }}
      ></FlatList>
    </ScrollView>
  );
}
