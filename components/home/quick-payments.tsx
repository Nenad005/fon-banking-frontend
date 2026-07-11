import { Text } from "@/components/text";
import { Transaction } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import {
  getCounterpartyAccountId,
  getTransactionIconName,
} from "@/lib/transaction-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, View, useWindowDimensions } from "react-native";

type QuickPaymentEntry = {
  accountId: string;
  name: string;
  icon: ReturnType<typeof getTransactionIconName>;
};

type QuickPaymentItem = QuickPaymentEntry | { isAddButton: true };

export default function QuickPayments({
  className = "",
  transactions,
  accountIds,
}: {
  className?: string;
  transactions: Transaction[];
  accountIds: Set<string>;
}) {
  const { width } = useWindowDimensions();
  const [activePage, setActivePage] = useState(0);
  const pageWidth = width - 40;

  const quickPayData = useMemo(() => {
    const entries = new Map<string, QuickPaymentEntry>();

    transactions.forEach((transaction) => {
      if (!accountIds.has(transaction.senderAccount)) return;

      const counterpartyAccountId = getCounterpartyAccountId(
        transaction,
        accountIds,
      );

      if (entries.has(counterpartyAccountId)) return;

      entries.set(counterpartyAccountId, {
        accountId: counterpartyAccountId,
        name: transaction.recipientName,
        icon: getTransactionIconName(transaction, accountIds),
      });
    });

    return Array.from(entries.values()).slice(0, 8);
  }, [accountIds, transactions]);

  const quickPaymentPages = useMemo(() => {
    const items: QuickPaymentItem[] = [...quickPayData, { isAddButton: true }];

    return items.reduce<QuickPaymentItem[][]>((pages, item, index) => {
      const pageIndex = Math.floor(index / 4);
      (pages[pageIndex] ??= []).push(item);
      return pages;
    }, []);
  }, [quickPayData]);

  return (
    <View className={cn("", className)}>
      <Text className="text-cgray text-2xl pb-5">Brza placanja</Text>
      <FlatList
        data={quickPaymentPages}
        horizontal
        pagingEnabled
        directionalLockEnabled
        keyExtractor={(_, index) => `quick-payment-page-${index}`}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          setActivePage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
        }}
        renderItem={({ item: page, index: pageIndex }) => (
          <View className="flex-row justify-between" style={{ width: pageWidth }}>
            {page.map((item, itemIndex) => {
              if ("isAddButton" in item) {
                return (
                  <Pressable key={`add-${pageIndex}`}>
                    <View className="w-[72px] items-center">
                      <View className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-ccyan">
                        <Ionicons name="add" size={30} className="text-white" />
                      </View>
                      <Text className="mt-2 h-10 w-full text-center leading-[18px] text-ctirquise">
                        Dodaj
                      </Text>
                    </View>
                  </Pressable>
                );
              }

              return (
                <Pressable key={item.accountId ?? itemIndex}>
                  <View className="w-[72px] items-center">
                    <View className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-gray-200">
                      <Ionicons name={item.icon} size={24} className="text-cgray" />
                    </View>
                    <Text
                      className="mt-2 h-10 w-full text-center leading-[18px]"
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      {item.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      {quickPaymentPages.length > 1 && (
        <View className="flex-row justify-center gap-2 pt-3">
          {quickPaymentPages.map((_, index) => (
            <View
              key={index}
              className={cn(
                "h-2 w-2 rounded-full",
                index === activePage ? "bg-ctirquise" : "bg-gray-300",
              )}
            />
          ))}
        </View>
      )}
    </View>
  );
}
