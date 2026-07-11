import { Account, Card } from "@/hooks/useBankingData";
import { useRef, useState } from "react";
import { View, ViewToken, ViewabilityConfigCallbackPair } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { ClassNameValue } from "tailwind-merge";
import AccountItem from "./account-item";
import CardItem from "./card-item";
import CardsPagination from "./cards-pagination";

export default function CardsSwiper({
  accountsData,
  cardsData,
}: {
  accountsData?: Account[];
  cardsData?: Card[];
}) {
  const scrollX = useSharedValue(0);

  const onScrollHandle = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (
      viewableItems.length > 0 &&
      viewableItems[0].index !== undefined &&
      viewableItems[0].index !== null
    ) {
      setPaginationIndex(viewableItems[0].index);
    }
  };

  const length = accountsData
    ? accountsData.length
    : cardsData
      ? cardsData.length
      : 0;

  const viewabilityConfigCallbackPairs = useRef<
    ViewabilityConfigCallbackPair[]
  >([{ viewabilityConfig, onViewableItemsChanged }]);

  const [paginationIndex, setPaginationIndex] = useState(0);

  const accountColorClassNamesDict: Record<
    string,
    Record<string, ClassNameValue>
  > = {
    magenta: {
      background: "bg-cmagenta/90",
      icon: "text-[#E58EC3]",
    },
    tirquise: {
      background: "bg-ctirquise/80",
      icon: "text-ctirquise",
    },
  };

  const colorClassNames: ClassNameValue[] | undefined = accountsData
    ? accountsData.map(
        (account) =>
          (accountColorClassNamesDict[account.color]?.background ??
            accountColorClassNamesDict.magenta.background) as ClassNameValue,
      )
    : cardsData
      ? cardsData.map(
          (card) =>
            (card.cardType === "Master"
              ? "bg-purple-400"
              : "bg-cyan-500") as ClassNameValue,
        )
      : undefined;

  return (
    <View // PRIKAZ RACUNA
      className="border-0"
    >
      {accountsData && (
        <Animated.FlatList
          className=""
          data={accountsData}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          horizontal
          onScroll={onScrollHandle}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          renderItem={({ item: account, index }) => {
            return (
              <AccountItem
                account={account}
                index={index}
                length={accountsData.length}
                scrollX={scrollX}
              />
            );
          }}
        ></Animated.FlatList>
      )}
      {cardsData && (
        <Animated.FlatList
          className=""
          data={cardsData}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          horizontal
          onScroll={onScrollHandle}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          renderItem={({ item: card, index }) => {
            return (
              <CardItem
                card={card}
                index={index}
                length={cardsData.length}
                scrollX={scrollX}
              />
            );
          }}
        ></Animated.FlatList>
      )}
      <CardsPagination
        colorClassNames={colorClassNames}
        defaultColorClassName={"bg-cmagenta"}
        length={length}
        paginationIndex={paginationIndex}
        scrollX={scrollX}
      />
    </View>
  );
}
