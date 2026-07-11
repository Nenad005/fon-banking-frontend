import { Text } from "@/components/text";
import { Transaction } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import { getTransactionIconName } from "@/lib/transaction-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

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
  const isYesterday = transactionDate.toDateString() === yesterday.toDateString();

  const date = isToday
    ? "Danas"
    : isYesterday
      ? "Juce"
      : `${transactionDate.getDate().toString().padStart(2, "0")}. ${monthStrings[transactionDate.getMonth()]}`;

  const time = `${transactionDate.getHours().toString().padStart(2, "0")}:${transactionDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return `${date} ${time}`;
};

export default function RecentTransactions({
  className = "",
  transactions,
  accountIds,
  isLoading = false,
}: {
  className?: string;
  transactions: Transaction[];
  accountIds: Set<string>;
  isLoading?: boolean;
}) {
  const recentTransactions = transactions.slice(0, 4);

  return (
    <View className={cn("gap-5", className)}>
      <View className="flex-row justify-between items-end ">
        <Text className="text-cgray text-2xl">Poslednje transakcije</Text>
        <Text className="text-ctirquise font-inter font-medium text-[14px] pb-1">
          Prikazi sve
        </Text>
      </View>
      <View className="gap-3">
        {isLoading ? (
          <Text className="text-cgray font-inria-light">
            Ucitavanje transakcija...
          </Text>
        ) : null}
        {!isLoading && recentTransactions.length === 0 ? (
          <Text className="text-cgray font-inria-light">
            Nema transakcija za prikaz.
          </Text>
        ) : null}
        {recentTransactions.map((transaction) => {
          const isOutgoing = accountIds.has(transaction.senderAccount);
          const displayAmount = isOutgoing
            ? transaction.senderAmount ?? transaction.amount
            : transaction.recipientAmount ?? transaction.amount;
          const displayCurrency = isOutgoing
            ? transaction.senderCurrency ?? transaction.currency
            : transaction.recipientCurrency ?? transaction.currency;
          const formattedAmount = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(displayAmount);
          const dateTimeString = formatTransactionDateTime(
            transaction.transactionTime,
          );

          return (
            <View key={transaction.id} className="flex-row items-center w-full">
              <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                <Ionicons
                  name={getTransactionIconName(transaction, accountIds)}
                  size={30}
                  className="text-ctirquise"
                />
              </View>
              <View className="justify-between flex-1 pl-2">
                <Text className="font-inria-bold text-lg pb-2 text-nowrap text-ellipsis">
                  {isOutgoing
                    ? transaction.recipientName
                    : `Priliv sa ${transaction.senderAccount}`}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {dateTimeString}
                </Text>
              </View>
              <View className="items-end justify-between">
                <Text
                  className={cn(
                    "font-inria text-lg pb-2",
                    isOutgoing ? "text-red-400" : "text-green-400",
                  )}
                >
                  {isOutgoing ? "-" : ""}
                  {formattedAmount} {displayCurrency}
                </Text>
                <Text className="font-inria-light text-cgray">
                  {transaction.cardNumber
                    ? "Placanje Karticom"
                    : !isOutgoing
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
