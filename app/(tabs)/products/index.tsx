import { Account, accountsData, cardsData } from "@/assets/data/homePageData";
import ContentHeader from "@/components/content-header";
import CardsSwiper from "@/components/home/accounts/cards-swiper";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { Animated, Pressable, View } from "react-native";

function AccountProductItem({
  account,
  index,
}: {
  account: Account;
  index: number;
}) {
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

  const animationRef = useRef<LottieView>(null);

  const handleCopyPress = async () => {
    console.log("poceo");
    animationRef.current?.play();
    await Clipboard.setStringAsync(account.accountId);
    console.log("zavrsio");
  };

  return (
    <Animated.View className={cn("w-full")}>
      <View
        key={account.accountId}
        className={cn(
          "p-4 rounded-3xl aspect-[2.7] overflow-hidden",
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
          <Text className="text-white uppercase text-xl">{account.title}</Text>
          <MaterialIcons name="more-vert" size={24} color="white" />
        </View>
        <View className="mt-auto">
          <View className="flex-row items-end gap-2">
            <Text className="text-cyellow text-5xl font-inconsolata-extrabold">
              {formattedBalance}
            </Text>
            <Text className="text-cyellow text-2xl font-inria-bold">
              {account.currency}
            </Text>
          </View>
        </View>
        <View className="flex-row items-end gap-1">
          <Text className="text-white font-lg">{formattedId}</Text>
          <Pressable className="h-fit" onPress={handleCopyPress}>
            <LottieView
              ref={animationRef}
              source={require("@/assets/lottie/Checkmark.json")} // Your downloaded Lottie file
              autoPlay={false}
              loop={false}
              style={{ width: 25, height: 25 }}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

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
        <View className="gap-5">
          {accountsData.map((account, index) => {
            return (
              <AccountProductItem
                account={account}
                index={index}
                key={"accountProduct-" + account.accountId}
              ></AccountProductItem>
            );
          })}
        </View>
      </View>
    </View>
  );
}
