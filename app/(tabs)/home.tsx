import { accountsData } from "@/assets/data/homePageData";
import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import QuickPayments from "@/components/home/quick-payments";
import RecentTransactions from "@/components/home/recent-transactions";
import { Text } from "@/components/text";
import { ScrollView, View } from "react-native";

export default function HomePage() {
  return (
    <View className="flex-1 pt-14">
      <ContentHeader
        title="Dobrodosao, Marko"
        subtitle="Pregled vasih finansija"
        className="px-5 border-0 pb-7"
      ></ContentHeader>
      <CardsSwiper accountsData={accountsData}></CardsSwiper>
      <ScrollView>
        <View className="flex-1 px-5 w-full ">
          <QuickPayments className="pb-9" />
          <RecentTransactions className="pb-9" />
          <View>
            <Text className="text-cgray text-2xl pb-9">Kursna lista</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

{
  /* <Text className="font-bold text-xl">Pocetna stranica</Text>
<Link href={"/products/account/1"} asChild>
  <Button title="Dinarski Racun"></Button>
</Link>
<Link href={"/products/account/2"} asChild>
  <Button title="Devizni Racun"></Button>
</Link> */
}
