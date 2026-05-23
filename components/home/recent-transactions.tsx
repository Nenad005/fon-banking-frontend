import { Transaction, transactionsData } from "@/assets/data/homePageData";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

export default function RecentTransactions({
  className = "",
}: {
  className?: string;
}) {
  const recentTransactions: Transaction[] = transactionsData.slice(0, 4);

  return (
    <View className={cn("gap-5", className)}>
      <View className="flex-row justify-between items-end ">
        <Text className="text-cgray text-2xl">Poslednje transakcije</Text>
        <Text className="text-ctirquise font-inter font-medium text-[14px] pb-1">
          Prikazi sve
        </Text>
      </View>
      <View className="gap-3">
        {recentTransactions.map((transaction) => {
          const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const formattedAmount = formatter.format(transaction.amount);

          return (
            <View key={transaction.id} className="flex-row items-center w-full">
              <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                <Ionicons
                  name={`cart-outline`}
                  size={30}
                  className="text-ctirquise"
                />
              </View>
              <View className="justify-between flex-1 pl-2">
                <Text className="font-inria-bold text-lg pb-2 text-nowrap text-ellipsis">
                  {transaction.transactionType === "odliv"
                    ? transaction.recipientName
                    : transaction.senderName}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {transaction.transactionTime.slice(0, 5)}
                </Text>
              </View>
              <View className="items-end justify-between">
                <Text
                  className={cn(
                    "font-inria text-lg pb-2",
                    transaction.transactionType === "odliv"
                      ? "text-red-400"
                      : "text-green-400",
                  )}
                >
                  {transaction.transactionType === "odliv" ? "-" : ""}
                  {formattedAmount} {transaction.currency}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {transaction.cardNumber
                    ? "Placanje Karticom"
                    : transaction.transactionType === "priliv"
                      ? "Uplata na racun"
                      : "Odliv sa racuna"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
