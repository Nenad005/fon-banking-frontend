import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import AccountProductItem from "@/components/products/account-product-item";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function ProductsPage() {
  const { accounts, cards, isLoading, errorMessage, refetch } =
    useBankingData();
  const router = useRouter();
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

  return (
    <View className="flex-1 bg-white pt-14">
      <ContentHeader
        title="Vaši proizvodi"
        subtitle="Pregled vaših računa i kartica"
        className="px-5 border-0 pb-7"
      ></ContentHeader>
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
        {errorMessage ? (
          <Text className="text-red-600 font-inria-regular px-5 pb-5">
            {errorMessage}
          </Text>
        ) : null}
        {isLoading && accounts.length === 0 && cards.length === 0 ? (
          <View className="h-[220px] justify-center items-center">
            <ActivityIndicator />
          </View>
        ) : null}
        {cards.length > 0 ? (
          <>
            <Text className="text-cgray text-2xl pb-5 px-5">Vaše kartice</Text>
            <CardsSwiper
              cardsData={cards}
              onCardPress={(card) =>
                router.push({
                  pathname: "/products/card/[id]",
                  params: { id: card.cardId },
                })
              }
            ></CardsSwiper>
          </>
        ) : null}
        <View className="px-5 pb-10">
          <Text className="text-cgray text-2xl pb-5">Vaši računi</Text>
          {!isLoading && accounts.length === 0 ? (
            <Text className="text-cgray font-inria-light">
              Nema računa za prikaz.
            </Text>
          ) : null}
          <View className="gap-5">
            {accounts.map((account) => {
              return (
                <AccountProductItem
                  account={account}
                  onPress={() =>
                    router.push({
                      pathname: "/products/account/[id]",
                      params: { id: account.accountId },
                    })
                  }
                  key={"accountProduct-" + account.accountId}
                ></AccountProductItem>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
