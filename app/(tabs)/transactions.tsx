import { Text } from "@/components/text";
import { Transaction, useBankingData } from "@/hooks/useBankingData";
import { AccountNumber } from "@/lib/account-number";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { File, Paths } from "expo-file-system";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import LottieView from "lottie-react-native";

const PAGE_SIZE = 10;

type TransactionFilter = "all" | "income" | "expense";
type ExtraFilter = "all" | "7days" | "30days" | "card" | "pending";
type TransactionSource =
  { type: "account"; id: string } | { type: "card"; id: string } | null;
type TransactionSearchParams = {
  sourceRequest?: string;
  sourceType?: "all" | "account" | "card";
  sourceId?: string;
};

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

export default function TransactionsPage() {
  const sourceParams = useLocalSearchParams<TransactionSearchParams>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [extraFilter, setExtraFilter] = useState<ExtraFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<TransactionSource>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!sourceParams.sourceRequest) return;

    startTransition(() => {
      setSearchQuery("");
      setFilter("all");
      setExtraFilter("all");
      setSourceFilter(
        sourceParams.sourceId &&
          (sourceParams.sourceType === "account" ||
            sourceParams.sourceType === "card")
          ? { type: sourceParams.sourceType, id: sourceParams.sourceId }
          : null,
      );
    });
  }, [
    sourceParams.sourceId,
    sourceParams.sourceRequest,
    sourceParams.sourceType,
  ]);

  const {
    transactions,
    accounts,
    cards,
    accountIds,
    isLoading,
    isLoadingMoreTransactions,
    hasMoreTransactions,
    transactionTotal,
    errorMessage,
    loadMoreTransactions,
    getAllTransactions,
    refetch,
  } = useBankingData({
    search: deferredSearchQuery,
    direction: filter === "all" ? undefined : filter,
    period:
      extraFilter === "7days" || extraFilter === "30days"
        ? extraFilter
        : undefined,
    method:
      extraFilter === "card" || extraFilter === "pending"
        ? extraFilter
        : undefined,
    accountId: sourceFilter?.type === "account" ? sourceFilter.id : undefined,
    cardId: sourceFilter?.type === "card" ? sourceFilter.id : undefined,
    perPage: PAGE_SIZE,
  });

  const transactionAccountIds = useMemo(() => {
    if (sourceFilter?.type === "account") {
      return new Set([sourceFilter.id]);
    }

    if (sourceFilter?.type === "card") {
      const selectedCard = cards.find(
        (card) => card.cardId === sourceFilter.id,
      );
      return selectedCard ? new Set([selectedCard.accountId]) : accountIds;
    }

    return accountIds;
  }, [accountIds, cards, sourceFilter]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => void refetch(), 60_000);
      return () => clearInterval(interval);
    }, [refetch]),
  );

  const groupedTransactions = useMemo(() => {
    const groups: {
      key: string;
      label: string;
      transactions: Transaction[];
    }[] = [];

    transactions.forEach((transaction) => {
      const group = getTransactionGroup(transaction.transactionTime);
      const previousGroup = groups.at(-1);
      if (previousGroup?.key === group.key)
        previousGroup.transactions.push(transaction);
      else groups.push({ ...group, transactions: [transaction] });
    });

    return groups;
  }, [transactions]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 180;

    if (isNearBottom && hasMoreTransactions && !isLoadingMoreTransactions) {
      void loadMoreTransactions();
    }
  };

  const animationRef = useRef<LottieView>(null);

  const downloadTransactions = async () => {
    try {
      const allTransactions = await getAllTransactions();
      const escapeCsv = (value: string | number | null) =>
        `"${String(value ?? "").replaceAll('"', '""')}"`;
      const rows = allTransactions.map((transaction) =>
        [
          transaction.transactionTime,
          transaction.senderAccount,
          transaction.recipientAccount,
          transaction.recipientName,
          transaction.paymentPurpose,
          transaction.amount,
          transaction.currency,
          transaction.status,
        ]
          .map(escapeCsv)
          .join(","),
      );
      const csv = [
        "Date,Sender account,Recipient account,Recipient,Purpose,Amount,Currency,Status",
        ...rows,
      ].join("\n");

      const file = new File(Paths.cache, "transactions.csv");
      file.create({ overwrite: true });
      file.write(`\uFEFF${csv}`);
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.error("Error downloading transactions:", error);
      Alert.alert("Greška", "CSV fajl nije mogao da bude preuzet.");
    }
  };

  const filters: { label: string; value: TransactionFilter }[] = [
    { label: "Sve", value: "all" },
    { label: "Uplate", value: "income" },
    { label: "Isplate", value: "expense" },
  ];

  return (
    <View className="flex-1 bg-white pt-12">
      {/* <ContentHeader
        title="Transakcije"
        subtitle="Pregled svih priliva i odliva"
        className="border-0 px-5 pb-6"
      /> */}
      <View className="flex-row items-start justify-between pb-11 px-5 pb-6">
        <View>
          <Text className="text-3xl leading-9 text-black">Transakcije</Text>
          <Text className="font-inria-light text-lg text-cgray">
            Pregled svih priliva i odliva
          </Text>
        </View>
        <Pressable
          className="mt-1 h-[50px] w-[50px] items-center justify-center rounded-[18px]"
          onPress={() => {
            animationRef.current?.play(0);
            void downloadTransactions();
          }}
        >
          <LottieView
            ref={animationRef}
            source={require("@/assets/lottie/Download icon.json")}
            autoPlay={false}
            loop={false}
            colorFilters={[{ keypath: "**", color: "#D057A0" }]}
            style={{ width: 25, height: 25 }}
          />
        </Pressable>
      </View>
      <ScrollView
        contentContainerClassName="px-3 pb-10"
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor="#004B7C"
            colors={["#004B7C"]}
          />
        }
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={false}
      >
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
            onPress={() => {
              if (searchQuery) {
                setSearchQuery("");
              }
            }}
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
                onPress={() => {
                  setFilter(filterOption.value);
                }}
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
                extraFilter === "all" && sourceFilter === null
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
              {extraFilter !== "all" || sourceFilter !== null ? (
                <Pressable
                  onPress={() => {
                    setExtraFilter("all");
                    setSourceFilter(null);
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
                  onPress={() => {
                    setExtraFilter(item.value);
                  }}
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
              Račun ili kartica
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  setSourceFilter(null);
                }}
                className={cn(
                  "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                  sourceFilter === null
                    ? "border-[#60c3ad] bg-[#60c3ad]"
                    : "border-[#dedede] bg-white",
                )}
              >
                <Ionicons
                  name="apps-outline"
                  size={16}
                  color={sourceFilter === null ? "#ffffff" : "#505050"}
                />
                <Text
                  className={cn(
                    "text-sm",
                    sourceFilter === null ? "text-white" : "text-cgray",
                  )}
                >
                  Sve
                </Text>
              </Pressable>
              {accounts.map((account) => {
                const isSelected =
                  sourceFilter?.type === "account" &&
                  sourceFilter.id === account.accountId;

                return (
                  <Pressable
                    key={`account-${account.accountId}`}
                    onPress={() => {
                      setSourceFilter({
                        type: "account",
                        id: account.accountId,
                      });
                    }}
                    className={cn(
                      "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                      isSelected
                        ? "border-[#60c3ad] bg-[#60c3ad]"
                        : "border-[#dedede] bg-white",
                    )}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={isSelected ? "#ffffff" : "#505050"}
                    />
                    <Text
                      className={cn(
                        "text-sm",
                        isSelected ? "text-white" : "text-cgray",
                      )}
                    >
                      {account.title} ·{" "}
                      {new AccountNumber(account.accountId).format()}
                    </Text>
                  </Pressable>
                );
              })}
              {cards.map((card) => {
                const isSelected =
                  sourceFilter?.type === "card" &&
                  sourceFilter.id === card.cardId;

                return (
                  <Pressable
                    key={`card-${card.cardId}`}
                    onPress={() => {
                      setSourceFilter({ type: "card", id: card.cardId });
                    }}
                    className={cn(
                      "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                      isSelected
                        ? "border-[#60c3ad] bg-[#60c3ad]"
                        : "border-[#dedede] bg-white",
                    )}
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={isSelected ? "#ffffff" : "#505050"}
                    />
                    <Text
                      className={cn(
                        "text-sm",
                        isSelected ? "text-white" : "text-cgray",
                      )}
                    >
                      {card.cardType} ···· {card.cardId.slice(-4)}
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
            {transactionTotal} rezultata
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
        {!isLoading && transactions.length === 0 ? (
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
                const direction = transaction.getDirection(
                  transactionAccountIds,
                );
                const isExpense = direction === "outgoing";
                const isInternal = direction === "internal";
                const amount = transaction.getDisplayAmount(
                  transactionAccountIds,
                );
                const currency = transaction.getDisplayCurrency(
                  transactionAccountIds,
                );
                const senderAccountTitle = accounts.find(
                  (account) => account.accountId === transaction.senderAccount,
                )?.title;
                const recipientAccountTitle = accounts.find(
                  (account) =>
                    account.accountId === transaction.recipientAccount,
                )?.title;
                const title = isInternal
                  ? `${senderAccountTitle ?? transaction.senderName} → ${recipientAccountTitle ?? transaction.recipientName}`
                  : isExpense
                    ? (recipientAccountTitle ?? transaction.recipientName)
                    : (senderAccountTitle ?? transaction.senderName);

                return (
                  <View
                    key={transaction.id}
                    className="min-h-[66px] flex-row items-center px-1 py-1.5"
                  >
                    <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-[#f3f3f3]">
                      <Ionicons
                        name={transaction.getIcon(transactionAccountIds)}
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
                          isInternal
                            ? "text-ctirquise"
                            : isExpense
                              ? "text-[#ff2033]"
                              : "text-[#12b964]",
                        )}
                        numberOfLines={1}
                      >
                        {isInternal ? "" : isExpense ? "-" : "+"}
                        {formatAmount(amount)} {currency}
                      </Text>
                      <Text
                        className="pt-1 font-inria-light text-sm text-cgray"
                        numberOfLines={1}
                      >
                        {transaction.cardNumber
                          ? "Plaćanje karticom"
                          : isInternal
                            ? "Interni prenos"
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

        {isLoadingMoreTransactions ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#60C3AD" />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
