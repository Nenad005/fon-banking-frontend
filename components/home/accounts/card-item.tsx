import { Card } from "@/hooks/useBankingData";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function CardItem({
  card,
  index,
  scrollX,
  length,
  onPress,
}: {
  card: Card;
  index: number;
  scrollX: SharedValue<number>;
  length: number;
  onPress?: () => void;
}) {
  let { width } = Dimensions.get("screen");
  width *= 0.9;

  const reAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [-width * 0.11, 0, width * 0.11],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            [(index - 1) * width, index * width, (index + 1) * width],
            [0.85, 1, 0.85],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  let formattedId = "";
  let dash = false;
  let didigts = 0;
  for (let i = 0; i < card.accountId.length; i++) {
    if (dash) {
      if (didigts % 4 === 0) {
        formattedId += " ";
      }
      formattedId += card.accountId[i];
      didigts++;
    } else {
      if (card.accountId[i] === "-") {
        dash = true;
      } else formattedId += card.accountId[i];
    }
  }

  let hiddenCardDigits = ["", "", "", ""];
  let j = 0;
  for (let i = 0; i < card.cardId.length; i++) {
    if (i % 4 === 0 && i !== 0) {
      j++;
    }
    if (i < 12) hiddenCardDigits[j] += "*";
    else hiddenCardDigits[j] += card.cardId[i];
  }


  const expireDate = new Date(card.expireDate);

  // const monthString = (expireDate.getMonth() + 1).toString().padStart(2, "0");
  const yearString = expireDate.getFullYear().toString().slice(2, 4);

  return (
    <Animated.View
      className={cn("w-[90vw] pl-5", index === length - 1 ? "mx-5" : "")}
      style={reAnimatedStyle}
    >
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={onPress ? `Otvori ${card.cardType} karticu` : undefined}
        key={card.cardId}
        onPress={onPress}
        className={cn("p-4 rounded-3xl relative justify-between aspect-[1.6]")}
      >
        <View className="absolute inset-0 bg-red-400 rounded-3xl overflow-hidden">
          <LinearGradient
            className="w-full h-full"
            colors={
              card.cardType !== "Master"
                ? ["#004B7C", "#60C3AD"]
                : ["#004B7C", "#D057A0"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        <View className="flex-row justify-between">
          <View className="gap-2">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require("@/assets/images/FON-Logo.svg")}
                style={{ width: 35, height: 35 }}
              ></Image>
              <Text className="text-white text-3xl font-dangrek">
                FON <Text className="text-4xl font-darling">kartica</Text>
              </Text>
            </View>
            <Text className="text-white">{formattedId}</Text>
          </View>
          <Image
            source={require("@/assets/images/card-nfc.svg")}
            style={{ width: 35, height: 35 }}
          ></Image>
        </View>
        <View className="flex-row justify-between items-end">
          <View>
            <View className="flex-row gap-2">
              {hiddenCardDigits.map((section, index) => {
                return (
                  <Text
                    className={cn(
                      "text-white text-[21px]",
                      index === 3 ? "" : "pt-[2px] tracking-wide text-[25px]",
                    )}
                    key={"card-digits-" + index}
                  >
                    {section}
                  </Text>
                );
              })}
            </View>
            <View className="flex-row gap-2">
              <Text className="text-white text-[15px] pt-[2px] tracking-wider">
                **
              </Text>
              <Text className="text-white text-[15px]">/</Text>
              <Text className="text-white text-[15px]">{yearString}</Text>
            </View>
            <Text className="text-white">{card.ownerName}</Text>
          </View>
          {card.cardType === "Master" ? (
            <Image
              source={require("@/assets/images/mastercard-logo.svg")}
              style={{ height: 35, aspectRatio: 1.42 }}
            ></Image>
          ) : (
            <Image
              source={require("@/assets/images/visa-logo.svg")}
              style={{ height: 24, aspectRatio: 3.2 }}
            ></Image>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
