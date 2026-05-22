import transactionsData from "@/assets/data/transactionsData.json";
import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, View } from "react-native";

export default function HomePage() {
  const accountsData = [
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
    return two.vremeTransakcije.localeCompare(one.vremeTransakcije);
  });

  const recentTransactions = transactions.splice(0, 2);

  return (
    <View className="flex-1 pt-14 gap-7 ">
      <ContentHeader
        title="Dobrodosao, Marko"
        subtitle="Pregled vasih finansija"
        className="px-5 border-0"
      ></ContentHeader>
      <ScrollView // PRIKAZ RACUNA
        className="bg-gren-200 max-h-60 min-h-60 border-0 overflow-visible"
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
                if (didigts % 4 === 0) {
                  formattedId += " ";
                }
                formattedId += account.accountId[i];
                didigts++;
              } else {
                if (account.accountId[i] === "-") {
                  dash = true;
                } else formattedId += account.accountId[i];
              }
            }

            return (
              <View
                key={account.accountId}
                className={cn(
                  "p-4 rounded-3xl justify-between aspect-[1.6] overflow-hidden",
                  colorClassNames[account.color].background,
                )}
              >
                <View className="absolute bottom-[-10px] right-[-30px] rotate-[20deg]">
                  <FontAwesome
                    name="bank"
                    size={120}
                    className={colorClassNames[account.color].icon}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-white uppercase text-xl">
                    {account.title}
                  </Text>
                  <MaterialIcons name="more-vert" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-lg">
                    Ukupno raspolozivo stanje
                  </Text>
                  <View className="flex-row items-end gap-2">
                    <Text className="text-cyellow text-5xl font-inconsolata-extrabold">
                      {formattedBalance}
                    </Text>
                    <Text className="text-cyellow text-2xl font-inria-bold">
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
        <View>
          <View className="flex-row justify-between items-end">
            <Text className="text-cgray text-2xl">Poslednje transakcije</Text>
            <Text className="text-ctirquise font-inter font-medium text-[14px]"></Text>
          </View>
          <View>
            {recentTransactions.map((transaction) => {
              return (
                <View key={transaction.id} className="flex-row w-full">
                  <View className="flex justify-center items-center w-[55px] h-[55px] rounded-full bg-ccyan">
                    {/* {iconsFromName[entry.icon]} */}
                    <Ionicons
                      name={`cart-outline`}
                      size={30}
                      className="text-white"
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <View>
                      <Text>
                        {transaction.tipTransakcije === "odliv"
                          ? transaction.nazivPrimaoca
                          : transaction.nazivPosiljaoca}
                      </Text>
                      <Text>{transaction.vremeTransakcije}</Text>
                    </View>
                    <View>
                      <Text
                        className={cn(
                          "",
                          transaction.tipTransakcije === "odliv"
                            ? "text-red-400"
                            : "text-green-400",
                        )}
                      >
                        {transaction.tipTransakcije === "odliv" ? "-" : ""}
                        {transaction.iznos}
                      </Text>
                    </View>
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
