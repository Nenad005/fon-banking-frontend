import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, View } from "react-native";

export default function HomePage() {
  const accountsData = [
    {
      title: "GLAVNI RACUN",
      name: "Tekuci dinarski racun",
      accountId: "RS35-160500000001234567",
      balance: 145230,
      color: "#D057A0",
      currency: "RSD",
    },
    {
      title: "DEVIZNI RACUN",
      name: "Tekuci devizni racun",
      accountId: "EUR31-512572340004237267",
      balance: 1341.21,
      color: "#004B7C",
      currency: "EUR",
    },
  ];

  return (
    <View className="flex-1 pt-14 gap-7">
      <ContentHeader
        title="Dobrodosao, Marko"
        subtitle="Pregled vasih finansija"
        className="px-5 border-2 border-solid"
      ></ContentHeader>
      <ScrollView
        className="bg-gren-200 max-h-60 border-2 border-solid overflow-visible"
        horizontal={true}
        snapToEnd={true}
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-5 px-5">
          {accountsData.map((account, index) => {
            const formatter = new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            const formattedBalance = formatter.format(account.balance);
            let formattedId = "";
            let dash = false;
            let didigts = 0;
            for (let i = 0; i < account.accountId.length; i++) {
              if (dash) {
                if (didigts % 4 == 0) {
                  formattedId += " ";
                }
                formattedId += account.accountId[i];
                didigts++;
              } else {
                if (account.accountId[i] == "-") {
                  dash = true;
                } else formattedId += account.accountId[i];
              }
            }

            return (
              <View
                key={account.accountId}
                style={{ backgroundColor: account.color }}
                className="p-4 rounded-3xl justify-between aspect-[1.6]"
              >
                <View className="flex-row justify-between">
                  <Text className="text-white uppercase text-lg">
                    {account.title}
                  </Text>
                  <MaterialIcons name="more-vert" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-lg">
                    Ukupno raspolozivo stanje
                  </Text>
                  <View className="flex-row items-end gap-2">
                    <Text className="text-yellow text-5xl font-inconsolata-extrabold">
                      {formattedBalance}
                    </Text>
                    <Text className="text-yellow text-2xl font-inria-bold">
                      {account.currency}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-end gap-3">
                  <Text className="text-white font-lg">{formattedId}</Text>
                  <View className="h-fit pb-1">
                    <Feather name="copy" size={18} color="white" />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex gap-9 px-5">
        <View>
          <Text className="text-cgray text-2xl">Brza placanja</Text>
        </View>
        <View>
          <Text className="text-cgray text-2xl">Poslednje transakcije</Text>
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
