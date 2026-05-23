import transactionsData from "@/assets/data/transactionsData.json";
import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/cards-swiper";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, View } from "react-native";

export type Account = {
  title: string;
  name: string;
  accountId: string;
  balance: number;
  color: "magenta" | "tirquise";
  currency: string;
};

export default function HomePage() {
  const accountsData: Account[] = [
    {
      title: "GLAVNI RACUN",
      name: "Tekuci dinarski racun",
      accountId: "RS35-160500000001234567",
      balance: 145230,
      color: "magenta",
      currency: "RSD",
    },
    {
      title: "DEVIZNI RACUN",
      name: "Tekuci devizni racun",
      accountId: "EUR31-512572340004237267",
      balance: 1341.21,
      color: "tirquise",
      currency: "EUR",
    },
  ];

  const colorClassNames: Record<string, Record<string, string>> = {
    magenta: {
      background: "bg-cmagenta/90",
      icon: "text-[#E58EC3]",
    },
    tirquise: {
      background: "bg-ctirquise/80",
      icon: "text-ctirquise",
    },
  };

  const quickPayData = [
    {
      name: "Brat",
      icon: "person" as "person" | "receipt",
    },
    {
      name: "Sestra",
      icon: "person" as "person" | "receipt",
    },
    {
      name: "Infostan",
      icon: "receipt" as "person" | "receipt",
    },
  ];
  const transactions = transactionsData.sort((one, two) => {
    return two.transactionTime.localeCompare(one.transactionTime);
  });

  const recentTransactions = transactions.splice(0, 5);

  return (
    <View className="flex-1 pt-14 gap-7 ">
      <ContentHeader
        title="Dobrodosao, Marko"
        subtitle="Pregled vasih finansija"
        className="px-5 border-0"
      ></ContentHeader>
      <CardsSwiper accountsData={accountsData}></CardsSwiper>
      <View className="flex gap-9 px-5 w-full ">
        <View className="">
          <Text className="text-cgray text-2xl pb-5">Brza placanja</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-5">
              {quickPayData.map((entry, index) => {
                return (
                  <Pressable key={entry.name + index}>
                    <View className="flex justify-center">
                      <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                        <Ionicons
                          name={`${entry.icon}-outline`}
                          size={24}
                          className="text-cgray"
                        />
                      </View>
                      <Text className="text-center">{entry.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable>
                <View className="flex justify-center">
                  <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-ccyan">
                    {/* {iconsFromName[entry.icon]} */}
                    <Ionicons name={`add`} size={30} className="text-white" />
                  </View>
                  <Text className="text-center text-ctirquise">Dodaj</Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </View>
        <View className="gap-5">
          <View className="flex-row justify-between items-end ">
            <Text className="text-cgray text-2xl">Poslednje transakcije</Text>
            <Text className="text-ctirquise font-inter font-medium text-[14px] pb-1">
              Prikazi sve
            </Text>
          </View>
          <View className="gap-0">
            {recentTransactions.map((transaction) => {
              const formatter = new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const formattedAmount = formatter.format(transaction.amount);

              return (
                <View
                  key={transaction.id}
                  className="flex-row items-center w-full"
                >
                  <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-gray-200">
                    {/* {iconsFromName[entry.icon]} */}
                    <Ionicons
                      name={`cart-outline`}
                      size={30}
                      className="text-ctirquise"
                    />
                  </View>
                  <View className="justify-between flex-1 pl-2">
                    <Text className="font-inria-bold text-lg pb-2 text-nowrap text-ellipsis">
                      {transaction.transactionType === "odliv"
                        ? transaction.recipientName
                        : transaction.senderName}
                    </Text>
                    <Text className="font-inria-light text-cgray">
                      {transaction.transactionTime.slice(0, 5)}
                    </Text>
                  </View>
                  <View className="items-end justify-between">
                    <Text
                      className={cn(
                        "font-inria text-lg pb-2",
                        transaction.transactionType === "odliv"
                          ? "text-red-400"
                          : "text-green-400",
                      )}
                    >
                      {transaction.transactionType === "odliv" ? "-" : ""}
                      {formattedAmount} {transaction.currency}
                    </Text>
                    <Text className="font-inria-light text-cgray">
                      {transaction.cardNumber
                        ? "Placanje Karticom"
                        : transaction.transactionTime === "priliv"
                          ? "Uplata na racun"
                          : "Uplata na racun"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        <View>
          <Text className="text-cgray text-2xl">Kursna lista</Text>
        </View>
      </View>
      {/* <Text className="font-bold text-xl">Pocetna stranica</Text>
      <Link href={"/products/account/1"} asChild>
        <Button title="Dinarski Racun"></Button>
      </Link>
      <Link href={"/products/account/2"} asChild>
        <Button title="Devizni Racun"></Button>
      </Link> */}
    </View>
  );
}
