import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import ExhangeRates from "@/components/home/exchange-rates";
import QuickPayments from "@/components/home/quick-payments";
import RecentTransactions from "@/components/home/recent-transactions";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { ActivityIndicator, ScrollView, View } from "react-native";

export default function HomePage() {
  const { accounts, transactions, accountIds, isLoading, errorMessage } =
    useBankingData();

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
        <CardsSwiper accountsData={accounts}></CardsSwiper>
      )}
      <ScrollView>
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
          />
          <RecentTransactions
            className="pb-10"
            transactions={transactions}
            accountIds={accountIds}
            isLoading={isLoading}
          />
          <ExhangeRates base="RSD" quoutes={["USD", "EUR", "CHF"]} />
        </View>
      </ScrollView>
    </View>
  );
}
