import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import AccountProductItem from "@/components/products/account-product-item";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";

export default function ProductsPage() {
  const { accounts, cards, isLoading, errorMessage } = useBankingData();
  const router = useRouter();

  return (
    <View className="flex-1 pt-14">
      <ContentHeader
        title="Vasi proizvodi"
        subtitle="Pregled vasih racuna i kartica"
        className="px-5 border-0 pb-7"
      ></ContentHeader>
      <ScrollView>
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
            <Text className="text-cgray text-2xl pb-5 px-5">Vase kartice</Text>
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
          <Text className="text-cgray text-2xl pb-5">Vasi racuni</Text>
          {!isLoading && accounts.length === 0 ? (
            <Text className="text-cgray font-inria-light">
              Nema racuna za prikaz.
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
