import { cn } from "@/lib/utils";
import { Dimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ClassNameValue } from "tailwind-merge";

const Dot = ({
  index,
  scrollX,
  paginationIndex,
  colorClassNames,
  defaultColorClassName,
}: {
  index: number;
  scrollX: SharedValue<number>;
  paginationIndex: number;
  colorClassNames?: ClassNameValue[];
  defaultColorClassName: ClassNameValue;
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

  const colorClass = colorClassNames
    ? index < colorClassNames.length
      ? colorClassNames[index]
      : defaultColorClassName
    : defaultColorClassName;

  return (
    <Animated.View
      className={cn(
        "bg-gray-400 h-2 w-2 rounded-full",
        index === paginationIndex ? colorClass : "bg-gray-400",
      )}
      style={pgAnimtionStyle}
    />
  );
};

export default function CardsPagination({
  length,
  paginationIndex,
  scrollX,
  colorClassNames,
  defaultColorClassName,
}: {
  length: number;
  paginationIndex: number;
  scrollX: SharedValue<number>;
  colorClassNames?: ClassNameValue[];
  defaultColorClassName: ClassNameValue;
}) {
  return (
    <View className="flex-row justify-center pt-4 pb-4 gap-2">
      {new Array(length).fill(0).map((_, index) => {
        return (
          <Dot
            colorClassNames={colorClassNames}
            defaultColorClassName={defaultColorClassName}
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
