import { Text } from "@/components/text";
import { Account, Transaction } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

const monthStrings = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

const formatTransactionDateTime = (transactionTime: string) => {
  const now = new Date();
  const transactionDate = new Date(transactionTime);
  const isToday = transactionDate.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    transactionDate.toDateString() === yesterday.toDateString();

  const date = isToday
    ? "Danas"
    : isYesterday
      ? "Juče"
      : `${transactionDate.getDate().toString().padStart(2, "0")}. ${monthStrings[transactionDate.getMonth()]}`;

  const time = `${transactionDate.getHours().toString().padStart(2, "0")}:${transactionDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return `${date} ${time}`;
};

export default function RecentTransactions({
  className = "",
  titleClassName = "",
  transactions,
  accounts,
  accountIds,
  isLoading = false,
  limit = 4,
  onViewAll,
}: {
  className?: string;
  titleClassName?: string;
  transactions: Transaction[];
  accounts: Account[];
  accountIds: Set<string>;
  isLoading?: boolean;
  limit?: number;
  onViewAll: () => void;
}) {
  const recentTransactions = transactions.slice(0, limit);

  return (
    <View className={cn("gap-5", className)}>
      <View className="flex-row justify-between items-end ">
        <Text className={cn("text-cgray text-2xl", titleClassName)}>
          Poslednje transakcije
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prikaži sve transakcije"
          hitSlop={10}
          onPress={onViewAll}
        >
          <Text className="text-ctirquise font-inter font-medium text-[14px] pb-1">
            Prikaži sve
          </Text>
        </Pressable>
      </View>
      <View className="gap-3">
        {!isLoading && recentTransactions.length === 0 ? (
          <Text className="text-cgray font-inria-light">
            Nema transakcija za prikaz.
          </Text>
        ) : null}
        {recentTransactions.map((transaction) => {
          const direction = transaction.getDirection(accountIds);
          const isOutgoing = direction === "outgoing";
          const isInternal = direction === "internal";
          const displayAmount = transaction.getDisplayAmount(accountIds);
          const displayCurrency = transaction.getDisplayCurrency(accountIds);
          const formattedAmount = new Intl.NumberFormat("sr-Latn-RS", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(displayAmount);
          const dateTimeString = formatTransactionDateTime(
            transaction.transactionTime,
          );
          const senderAccountTitle = accounts.find(
            (account) => account.accountId === transaction.senderAccount,
          )?.title;
          const recipientAccountTitle = accounts.find(
            (account) => account.accountId === transaction.recipientAccount,
          )?.title;

          return (
            <View key={transaction.id} className="flex-row items-center w-full">
              <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                <Ionicons
                  name={transaction.getIcon(accountIds)}
                  size={30}
                  className="text-ctirquise"
                />
              </View>
              <View className="justify-between flex-1 pl-2">
                <Text className="font-inria-bold text-lg pb-2 text-nowrap text-ellipsis">
                  {isInternal
                    ? `${senderAccountTitle ?? transaction.senderName} → ${recipientAccountTitle ?? transaction.recipientName}`
                    : isOutgoing
                      ? (recipientAccountTitle ?? transaction.recipientName)
                      : (senderAccountTitle ?? transaction.senderName)}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {dateTimeString}
                </Text>
              </View>
              <View className="items-end justify-between">
                <Text
                  className={cn(
                    "font-inria text-lg pb-2",
                    isInternal
                      ? "text-ctirquise"
                      : isOutgoing
                        ? "text-red-400"
                        : "text-green-400",
                  )}
                >
                  {isInternal ? "" : isOutgoing ? "-" : "+"}
                  {formattedAmount} {displayCurrency}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {transaction.cardNumber
                    ? "Plaćanje karticom"
                    : isInternal
                      ? "Interni prenos"
                      : !isOutgoing
                        ? "Uplata na račun"
                        : "Odliv sa računa"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
