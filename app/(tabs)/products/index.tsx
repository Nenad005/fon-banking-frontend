import { cardsData } from "@/assets/data/homePageData";
import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import { Text } from "@/components/text";
import { View } from "react-native";

export default function ProductsPage() {
  return (
    <View className="flex-1 pt-14">
      <ContentHeader
        title="Vasi proizvodi"
        subtitle="Pregled vasih racuna i katica"
        className="px-5 border-0 pb-7"
      ></ContentHeader>
      <Text className="text-cgray text-2xl pb-5 px-5">Vase kartice</Text>
      <CardsSwiper cardsData={cardsData}></CardsSwiper>
      <View className="px-5">
        <Text className="text-cgray text-2xl pb-5">Vasi racuni</Text>
      </View>
    </View>
    // <View className="flex justify-center items-center pt-20">
    //   <Text className="font-bold text-xl">Proizvodi stranica</Text>
    //   <Link href={"/products/account/1"} asChild>
    //     <Button title="Dinarski Racun"></Button>
    //   </Link>
    //   <Link href={"/products/account/2"} asChild>
    //     <Button title="Devizni Racun"></Button>
    //   </Link>
    // </View>
  );
}
