import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import { Transaction, useBankingData } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import { getTransactionIconName } from "@/lib/transaction-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Avg",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

const PAGE_SIZE = 8;

type TransactionFilter = "all" | "income" | "expense";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (transactionTime: string) => {
  const transactionDate = new Date(transactionTime);

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(transactionDate);
};

function MonthlyOverview({
  transactions,
  accountIds,
}: {
  transactions: Transaction[];
  accountIds: Set<string>;
}) {
  const months = useMemo(() => {
    const now = new Date();
    const entries = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: MONTH_LABELS[date.getMonth()],
        income: 0,
        expense: 0,
      };
    });
    const monthsByKey = new Map(entries.map((month) => [month.key, month]));

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionTime);
      const month = monthsByKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!month) return;

      const isExpense = accountIds.has(transaction.senderAccount);
      const amount = isExpense
        ? transaction.senderAmount ?? transaction.amount
        : transaction.recipientAmount ?? transaction.amount;

      if (isExpense) {
        month.expense += amount;
      } else {
        month.income += amount;
      }
    });

    return entries;
  }, [accountIds, transactions]);

  const highestAmount = Math.max(
    ...months.flatMap((month) => [month.income, month.expense]),
    1,
  );

  return (
    <View className="mb-7 rounded-3xl bg-[#f5f7f8] p-5">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-xl text-black">Pregled po mesecima</Text>
          <Text className="pt-1 font-inria-light text-base text-cgray">
            Prilivi i odlivi u poslednjih 6 meseci
          </Text>
        </View>
        <Ionicons name="stats-chart-outline" size={24} color="#004B7C" />
      </View>

      <View className="mt-5 flex-row items-end justify-between">
        {months.map((month) => (
          <View key={month.key} className="flex-1 items-center">
            <View className="h-[112px] flex-row items-end gap-1">
              <View
                className="w-[7px] rounded-t-full bg-[#4caf50]"
                style={{
                  height:
                    month.income === 0
                      ? 0
                      : Math.max(4, (month.income / highestAmount) * 104),
                }}
              />
              <View
                className="w-[7px] rounded-t-full bg-[#ef6b73]"
                style={{
                  height:
                    month.expense === 0
                      ? 0
                      : Math.max(4, (month.expense / highestAmount) * 104),
                }}
              />
            </View>
            <Text className="pt-2 text-xs text-cgray">{month.label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row justify-center gap-5">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-[#4caf50]" />
          <Text className="text-sm text-cgray">Prilivi</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-[#ef6b73]" />
          <Text className="text-sm text-cgray">Odlivi</Text>
        </View>
      </View>
    </View>
  );
}

export default function TransactionsPage() {
  const { transactions, accountIds, isLoading, errorMessage } = useBankingData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [currentPage, setCurrentPage] = useState(0);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return transactions.filter((transaction) => {
      const isExpense = accountIds.has(transaction.senderAccount);
      const matchesFilter =
        filter === "all" ||
        (filter === "expense" && isExpense) ||
        (filter === "income" && !isExpense);
      const searchableText = [
        transaction.recipientName,
        transaction.senderAccount,
        transaction.recipientAccount,
        transaction.paymentPurpose,
        transaction.paymentCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [accountIds, filter, searchQuery, transactions]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const visibleTransactions = filteredTransactions.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [filter, searchQuery]);

  useEffect(() => {
    if (currentPage >= pageCount) {
      setCurrentPage(pageCount - 1);
    }
  }, [currentPage, pageCount]);

  const filters: { label: string; value: TransactionFilter }[] = [
    { label: "Sve", value: "all" },
    { label: "Prilivi", value: "income" },
    { label: "Odlivi", value: "expense" },
  ];

  return (
    <View className="flex-1 bg-white pt-14">
      <ContentHeader
        title="Transakcije"
        subtitle="Pregled svih priliva i odliva"
        className="border-0 px-5 pb-7"
      />
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <MonthlyOverview transactions={transactions} accountIds={accountIds} />

        <View className="mb-4 flex-row items-center rounded-2xl bg-[#f5f7f8] px-4">
          <Ionicons name="search-outline" size={22} color="#505050" />
          <TextInput
            className="h-12 flex-1 pl-3 font-inria-regular text-lg text-cgray"
            onChangeText={setSearchQuery}
            placeholder="Pretraži transakcije"
            placeholderTextColor="#929292"
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#929292" />
            </Pressable>
          )}
        </View>

        <View className="mb-7 flex-row gap-2">
          {filters.map((filterOption) => {
            const isSelected = filter === filterOption.value;

            return (
              <Pressable
                key={filterOption.value}
                className={cn(
                  "rounded-full border px-4 py-2",
                  isSelected
                    ? "border-ctirquise bg-ctirquise"
                    : "border-[#d6d6d6] bg-white",
                )}
                onPress={() => setFilter(filterOption.value)}>
                <Text
                  className={cn(
                    "text-base",
                    isSelected ? "text-white" : "text-cgray",
                  )}>
                  {filterOption.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl text-black">Sve transakcije</Text>
          <Text className="font-inria-light text-base text-cgray">
            {filteredTransactions.length} rezultata
          </Text>
        </View>

        {errorMessage ? (
          <Text className="pb-5 text-red-600">{errorMessage}</Text>
        ) : null}
        {isLoading && transactions.length === 0 ? (
          <View className="h-40 items-center justify-center">
            <ActivityIndicator color="#004B7C" />
          </View>
        ) : null}
        {!isLoading && filteredTransactions.length === 0 ? (
          <View className="items-center rounded-3xl bg-[#f5f7f8] px-5 py-9">
            <Ionicons name="receipt-outline" size={36} color="#929292" />
            <Text className="pt-3 text-center text-lg text-cgray">
              Nema transakcija koje odgovaraju pretrazi.
            </Text>
          </View>
        ) : null}

        <View className="gap-3">
          {visibleTransactions.map((transaction) => {
            const isExpense = accountIds.has(transaction.senderAccount);
            const amount = isExpense
              ? transaction.senderAmount ?? transaction.amount
              : transaction.recipientAmount ?? transaction.amount;
            const currency = isExpense
              ? transaction.senderCurrency ?? transaction.currency
              : transaction.recipientCurrency ?? transaction.currency;
            const title = isExpense
              ? transaction.recipientName
              : `Priliv sa ${transaction.senderAccount}`;

            return (
              <View
                key={transaction.id}
                className="flex-row items-center rounded-2xl bg-[#f5f7f8] p-3">
                <View
                  className={cn(
                    "h-12 w-12 items-center justify-center rounded-full",
                    isExpense ? "bg-[#fee8e9]" : "bg-[#e4f5e5]",
                  )}>
                  <Ionicons
                    name={getTransactionIconName(transaction, accountIds)}
                    size={23}
                    color={isExpense ? "#df5660" : "#43a047"}
                  />
                </View>
                <View className="min-w-0 flex-1 px-3">
                  <Text className="text-lg text-black" numberOfLines={1}>
                    {title}
                  </Text>
                  <Text className="pt-1 font-inria-light text-sm text-cgray" numberOfLines={1}>
                    {transaction.paymentPurpose || formatDate(transaction.transactionTime)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={cn(
                      "text-base",
                      isExpense ? "text-[#df5660]" : "text-[#43a047]",
                    )}>
                    {isExpense ? "-" : "+"}
                    {formatAmount(amount)} {currency}
                  </Text>
                  <Text className="pt-1 font-inria-light text-sm text-cgray">
                    {formatDate(transaction.transactionTime)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {filteredTransactions.length > 0 && (
          <View className="mt-7 flex-row items-center justify-between rounded-2xl bg-[#f5f7f8] p-2">
            <Pressable
              className={cn(
                "rounded-xl px-4 py-2",
                currentPage === 0 ? "bg-[#e5e5e5]" : "bg-white",
              )}
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((page) => page - 1)}>
              <Text className="text-cgray">Prethodna</Text>
            </Pressable>
            <Text className="text-cgray">
              {currentPage + 1} / {pageCount}
            </Text>
            <Pressable
              className={cn(
                "rounded-xl px-4 py-2",
                currentPage === pageCount - 1 ? "bg-[#e5e5e5]" : "bg-white",
              )}
              disabled={currentPage === pageCount - 1}
              onPress={() => setCurrentPage((page) => page + 1)}>
              <Text className="text-cgray">Sledeća</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
