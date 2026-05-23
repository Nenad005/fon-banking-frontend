import { Account } from "@/app/(tabs)/home";
import { cn } from "@/lib/utils";
import { Dimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const Dot = ({
  index,
  scrollX,
  paginationIndex,
}: {
  index: number;
  scrollX: SharedValue<number>;
  paginationIndex: number;
}) => {
  let { width } = Dimensions.get("screen");
  width *= 0.9;

  const pgAnimtionStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 20, 8],
      Extrapolation.CLAMP,
    );

    return { width: dotWidth };
  });

  return (
    <Animated.View
      className={cn(
        "bg-gray-400 h-2 w-2 rounded-full",
        index === paginationIndex
          ? paginationIndex === 0
            ? "bg-cmagenta"
            : "bg-ctirquise"
          : "",
      )}
      style={pgAnimtionStyle}
    />
  );
};

export default function CardsPagination({
  items,
  paginationIndex,
  scrollX,
}: {
  items: Account[];
  paginationIndex: number;
  scrollX: SharedValue<number>;
}) {
  return (
    <View className="flex-row justify-center pt-4 gap-2">
      {items.map((_, index) => {
        return (
          <Dot
            index={index}
            paginationIndex={paginationIndex}
            scrollX={scrollX}
            key={index}
          />
        );
      })}
    </View>
  );
}
