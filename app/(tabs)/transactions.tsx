import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import { Transaction, useBankingData } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import {
  getTransactionCategory,
  getTransactionIconName,
  TRANSACTION_CATEGORIES,
  TransactionCategory,
} from "@/lib/transaction-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
type ExtraFilter = "all" | "7days" | "30days" | "card" | "pending";

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

const getTransactionGroup = (transactionTime: string) => {
  const date = new Date(transactionTime);
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  if (date >= sevenDaysAgo) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let label: string;

    if (day.getTime() === today.getTime()) label = "Danas";
    else if (day.getTime() === yesterday.getTime()) label = "Juče";
    else {
      label = new Intl.DateTimeFormat("sr-Latn-RS", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(date);
      label = label.charAt(0).toLocaleUpperCase("sr-Latn-RS") + label.slice(1);
    }

    return {
      key: `day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label,
    };
  }

  const label = new Intl.DateTimeFormat("sr-Latn-RS", {
    month: "long",
    year: "numeric",
  }).format(date);
  return {
    key: `month-${date.getFullYear()}-${date.getMonth()}`,
    label: label.charAt(0).toLocaleUpperCase("sr-Latn-RS") + label.slice(1),
  };
};

const formatTime = (transactionTime: string) =>
  new Intl.DateTimeFormat("sr-Latn-RS", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(transactionTime));

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
        ? (transaction.senderAmount ?? transaction.amount)
        : (transaction.recipientAmount ?? transaction.amount);

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
  const { transactions, accountIds, isLoading, errorMessage } =
    useBankingData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [extraFilter, setExtraFilter] = useState<ExtraFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<
    TransactionCategory | "all"
  >("all");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const now = new Date();

    return transactions.filter((transaction) => {
      const isExpense = accountIds.has(transaction.senderAccount);
      const matchesFilter =
        filter === "all" ||
        (filter === "expense" && isExpense) ||
        (filter === "income" && !isExpense);
      const age =
        now.getTime() - new Date(transaction.transactionTime).getTime();
      const matchesExtra =
        extraFilter === "all" ||
        (extraFilter === "7days" && age <= 7 * 86400000) ||
        (extraFilter === "30days" && age <= 30 * 86400000) ||
        (extraFilter === "card" && Boolean(transaction.cardNumber)) ||
        (extraFilter === "pending" && transaction.status === "na_cekanju");
      const matchesCategory =
        categoryFilter === "all" ||
        getTransactionCategory(transaction, accountIds) === categoryFilter;
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

      return (
        matchesFilter &&
        matchesExtra &&
        matchesCategory &&
        (!query || searchableText.includes(query))
      );
    });
  }, [
    accountIds,
    categoryFilter,
    extraFilter,
    filter,
    searchQuery,
    transactions,
  ]);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);
  const groupedTransactions = useMemo(() => {
    const groups: {
      key: string;
      label: string;
      transactions: Transaction[];
    }[] = [];

    visibleTransactions.forEach((transaction) => {
      const group = getTransactionGroup(transaction.transactionTime);
      const previousGroup = groups.at(-1);
      if (previousGroup?.key === group.key)
        previousGroup.transactions.push(transaction);
      else groups.push({ ...group, transactions: [transaction] });
    });

    return groups;
  }, [visibleTransactions]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryFilter, extraFilter, filter, searchQuery]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 180;

    if (isNearBottom && visibleCount < filteredTransactions.length) {
      setVisibleCount((count) =>
        Math.min(count + PAGE_SIZE, filteredTransactions.length),
      );
    }
  };

  const filters: { label: string; value: TransactionFilter }[] = [
    { label: "Sve", value: "all" },
    { label: "Uplate", value: "income" },
    { label: "Isplate", value: "expense" },
  ];

  return (
    <View className="flex-1 bg-white pt-12">
      <ContentHeader
        title="Transakcije"
        subtitle="Pregled svih priliva i odliva"
        className="border-0 px-5 pb-6"
      />
      <ScrollView
        contentContainerClassName="px-3 pb-10"
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
      >
        <MonthlyOverview transactions={transactions} accountIds={accountIds} />

        <View className="h-11 flex-row items-center rounded-[15px] border-2 border-[#d94c9f] px-3">
          <TextInput
            className="h-11 flex-1 font-inria-light text-lg text-[#303030]"
            onChangeText={setSearchQuery}
            placeholder="Pretraži transakcije"
            placeholderTextColor="#929292"
            value={searchQuery}
          />
          <Pressable
            hitSlop={10}
            onPress={() => searchQuery && setSearchQuery("")}
          >
            <Ionicons
              name={searchQuery ? "close" : "search-outline"}
              size={25}
              color="#d94c9f"
            />
          </Pressable>
        </View>

        <View className="mb-5 mt-3 flex-row items-center gap-2">
          {filters.map((filterOption) => {
            const isSelected = filter === filterOption.value;

            return (
              <Pressable
                key={filterOption.value}
                className={cn(
                  "rounded-full px-4 py-1.5",
                  isSelected ? "bg-[#60c3ad]" : "bg-[#eeeeee]",
                )}
                onPress={() => setFilter(filterOption.value)}
              >
                <Text
                  className={cn(
                    "text-base",
                    isSelected ? "text-white" : "text-cgray",
                  )}
                >
                  {filterOption.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            className="ml-auto h-9 w-9 items-center justify-center"
            onPress={() => setFiltersVisible((value) => !value)}
          >
            <Ionicons
              name="options-outline"
              size={27}
              color={
                extraFilter === "all" && categoryFilter === "all"
                  ? "#505050"
                  : "#d94c9f"
              }
            />
          </Pressable>
        </View>

        {filtersVisible ? (
          <View className="mb-5 rounded-[18px] border border-[#e2e2e2] bg-[#fafafa] p-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-inria-bold text-base">Dodatni filteri</Text>
              {extraFilter !== "all" || categoryFilter !== "all" ? (
                <Pressable
                  onPress={() => {
                    setExtraFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  <Text className="text-sm text-[#d94c9f]">Poništi</Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(
                [
                  { label: "Sve vreme", value: "all" },
                  { label: "7 dana", value: "7days" },
                  { label: "30 dana", value: "30days" },
                  { label: "Kartica", value: "card" },
                  { label: "Na čekanju", value: "pending" },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setExtraFilter(item.value)}
                  className={cn(
                    "mr-2 rounded-full border px-3 py-1.5",
                    extraFilter === item.value
                      ? "border-[#60c3ad] bg-[#60c3ad]"
                      : "border-[#dedede] bg-white",
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm",
                      extraFilter === item.value ? "text-white" : "text-cgray",
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text className="mb-2 mt-4 font-inria-bold text-sm text-cgray">
              Kategorija
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setCategoryFilter("all")}
                className={cn(
                  "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                  categoryFilter === "all"
                    ? "border-[#60c3ad] bg-[#60c3ad]"
                    : "border-[#dedede] bg-white",
                )}
              >
                <Ionicons
                  name="apps-outline"
                  size={16}
                  color={categoryFilter === "all" ? "#ffffff" : "#505050"}
                />
                <Text
                  className={cn(
                    "text-sm",
                    categoryFilter === "all" ? "text-white" : "text-cgray",
                  )}
                >
                  Sve
                </Text>
              </Pressable>
              {TRANSACTION_CATEGORIES.map((category) => {
                const isSelected = categoryFilter === category.value;

                return (
                  <Pressable
                    key={category.value}
                    onPress={() => setCategoryFilter(category.value)}
                    className={cn(
                      "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                      isSelected
                        ? "border-[#60c3ad] bg-[#60c3ad]"
                        : "border-[#dedede] bg-white",
                    )}
                  >
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={isSelected ? "#ffffff" : "#505050"}
                    />
                    <Text
                      className={cn(
                        "text-sm",
                        isSelected ? "text-white" : "text-cgray",
                      )}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl text-black">Transakcije</Text>
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

        {groupedTransactions.map((group) => (
          <View key={group.key} className="mb-4">
            <View className="mb-2 flex-row items-center gap-3 px-1">
              <Text className="font-inria-regular text-lg text-cgray">
                {group.label}
              </Text>
              <View className="h-px flex-1 bg-[#646464]" />
            </View>

            <View className="gap-1">
              {group.transactions.map((transaction) => {
                const isExpense = accountIds.has(transaction.senderAccount);
                const amount = isExpense
                  ? (transaction.senderAmount ?? transaction.amount)
                  : (transaction.recipientAmount ?? transaction.amount);
                const currency = isExpense
                  ? (transaction.senderCurrency ?? transaction.currency)
                  : (transaction.recipientCurrency ?? transaction.currency);
                const title = isExpense
                  ? transaction.recipientName
                  : transaction.recipientName ||
                    `Priliv sa ${transaction.senderAccount}`;

                return (
                  <View
                    key={transaction.id}
                    className="min-h-[66px] flex-row items-center px-1 py-1.5"
                  >
                    <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-[#f3f3f3]">
                      <Ionicons
                        name={getTransactionIconName(transaction, accountIds)}
                        size={27}
                        color="#005a91"
                      />
                    </View>
                    <View className="min-w-0 flex-1 px-3">
                      <Text
                        className="font-inria-bold text-base text-black"
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                      <Text
                        className="pt-1 font-inria-light text-sm text-cgray"
                        numberOfLines={1}
                      >
                        {formatDate(transaction.transactionTime)}{" "}
                        {formatTime(transaction.transactionTime)}
                      </Text>
                    </View>
                    <View className="max-w-[47%] items-end">
                      <Text
                        className={cn(
                          "text-base",
                          isExpense ? "text-[#ff2033]" : "text-[#12b964]",
                        )}
                        numberOfLines={1}
                      >
                        {isExpense ? "-" : "+"}
                        {formatAmount(amount)} {currency}
                      </Text>
                      <Text
                        className="pt-1 font-inria-light text-sm text-cgray"
                        numberOfLines={1}
                      >
                        {transaction.cardNumber
                          ? "Plaćanje karticom"
                          : isExpense
                            ? "Plaćanje sa računa"
                            : "Uplata na račun"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {visibleCount < filteredTransactions.length ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#60C3AD" />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
