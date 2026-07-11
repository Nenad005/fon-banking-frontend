import { Text } from "@/components/text";
import { Transaction } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import {
  getCounterpartyAccountId,
  getTransactionIconName,
} from "@/lib/transaction-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function QuickPayments({
  className = "",
  transactions,
  accountIds,
}: {
  className?: string;
  transactions: Transaction[];
  accountIds: Set<string>;
}) {
  const quickPayData = useMemo(() => {
    const entries = new Map<
      string,
      { name: string; icon: ReturnType<typeof getTransactionIconName> }
    >();

    transactions.forEach((transaction) => {
      if (!accountIds.has(transaction.senderAccount)) return;

      const counterpartyAccountId = getCounterpartyAccountId(
        transaction,
        accountIds,
      );

      if (entries.has(counterpartyAccountId)) return;

      entries.set(counterpartyAccountId, {
        name: transaction.recipientName,
        icon: getTransactionIconName(transaction, accountIds),
      });
    });

    return Array.from(entries.values()).slice(0, 8);
  }, [accountIds, transactions]);

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
                      name={entry.icon}
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
