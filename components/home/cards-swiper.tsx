import { Account } from "@/app/(tabs)/home";
import { useRef, useState } from "react";
import { View, ViewToken, ViewabilityConfigCallbackPair } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import CardItem from "./card-item";
import CardsPagination from "./cards-pagination";

export default function CardsSwiper({
  accountsData,
}: {
  accountsData: Account[];
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

  const viewabilityConfigCallbackPairs = useRef<
    ViewabilityConfigCallbackPair[]
  >([{ viewabilityConfig, onViewableItemsChanged }]);

  const [paginationIndex, setPaginationIndex] = useState(0);

  return (
    <View // PRIKAZ RACUNA
      className="border-0"
    >
      <Animated.FlatList
        className=""
        data={accountsData}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        horizontal
        onScroll={onScrollHandle}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        renderItem={({ item: account, index }) => {
          return (
            <CardItem
              account={account}
              index={index}
              length={accountsData.length}
              scrollX={scrollX}
            />
          );
        }}
      ></Animated.FlatList>
      <CardsPagination
        items={accountsData}
        paginationIndex={paginationIndex}
        scrollX={scrollX}
      />
    </View>
  );
}
