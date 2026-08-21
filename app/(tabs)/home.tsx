import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import ExhangeRates from "@/components/home/exchange-rates";
import QuickPayments, {
  QuickPaymentEntry,
} from "@/components/home/quick-payments";
import RecentTransactions from "@/components/home/recent-transactions";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function HomePage() {
  const {
    accounts,
    transactions,
    accountIds,
    isLoading,
    errorMessage,
    refetch,
  } = useBankingData();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const openQuickPayment = (payment: QuickPaymentEntry) => {
    router.navigate({
      pathname: "/payments",
      params: {
        quickPaymentRequest: Date.now().toString(),
        recipientName: payment.name,
        recipientAccount: payment.accountId,
        senderAccount: payment.senderAccountId,
        amount: payment.amount.toString(),
        model: payment.model?.toString() ?? "",
        referenceNumber: payment.referenceNumber ?? "",
        paymentPurpose: payment.paymentPurpose ?? "",
        paymentCode: payment.paymentCode ?? "",
      },
    });
  };

  return (
    <View className="flex-1 pt-14">
      <ContentHeader
        title="Dobrodosli"
        subtitle="Pregled vasih finansija"
        className="px-5 border-0 pb-7"
      ></ContentHeader>
      {isLoading && accounts.length === 0 ? (
        <View className="h-[220px] justify-center items-center">
          <ActivityIndicator />
        </View>
      ) : (
        <CardsSwiper
          accountsData={accounts}
          onAccountPress={(account) => {
            router.push({
              pathname: "/products/account/[id]",
              params: { id: account.accountId },
            });
          }}
        ></CardsSwiper>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor="#004B7C"
            colors={["#004B7C"]}
          />
        }
      >
        <View className="flex-1 px-5 w-full ">
          {errorMessage ? (
            <Text className="text-red-600 font-inria-regular pb-5">
              {errorMessage}
            </Text>
          ) : null}
          <QuickPayments
            className="pb-10"
            transactions={transactions}
            accountIds={accountIds}
            onSelect={openQuickPayment}
          />
          <RecentTransactions
            className="pb-10"
            transactions={transactions}
            accounts={accounts}
            accountIds={accountIds}
            isLoading={isLoading}
            onViewAll={() =>
              router.navigate({
                pathname: "/transactions",
                params: {
                  sourceRequest: Date.now().toString(),
                  sourceType: "all",
                },
              })
            }
          />
          <ExhangeRates base="RSD" quoutes={["USD", "EUR", "CHF"]} />
        </View>
      </ScrollView>
    </View>
  );
}
