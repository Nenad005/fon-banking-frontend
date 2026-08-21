import { Account } from "@/hooks/useBankingData";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { formatAccountNumber } from "@/lib/account-number";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function AccountItem({
  account,
  index,
  scrollX,
  length,
  onPress
}: {
  account: Account;
  index: number;
  scrollX: SharedValue<number>;
  length: number;
  onPress?: (account: Account) => void;
}) {
  let { width } = Dimensions.get("screen");
  width *= 0.9;

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
  const formattedId = formatAccountNumber(account.accountId);

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

  const animationRef = useRef<LottieView>(null);

  const handleCopyPress = async () => {
    console.log("poceo");
    animationRef.current?.play();
    await Clipboard.setStringAsync(account.accountId);
    console.log("zavrsio");
  };

  return (
    <Animated.View
      className={cn("w-[90vw] pl-5", index === length - 1 ? "mx-5" : "")}
      style={reAnimatedStyle}
    >
      <Pressable
        key={account.accountId}
        onPress={() => {onPress?.(account)}}
        className={cn(
          "p-4 rounded-3xl justify-between aspect-[1.6] overflow-hidden",
          (colorClassNames[account.color] ?? colorClassNames.magenta)
            .background,
        )}
      >
        <View className="absolute bottom-[-10px] right-[-30px] rotate-[20deg]">
          <FontAwesome
            name="bank"
            size={120}
            className={(colorClassNames[account.color] ?? colorClassNames.magenta).icon}
          />
        </View>
        <View className="flex-row items-start justify-between">
          <Text className="text-white uppercase text-xl">{account.title}</Text>
          <View className="flex-row items-center gap-1 rounded-full bg-black/15 px-3 py-1">
            <MaterialIcons name="account-balance" size={15} color="white" />
            <Text className="font-inria-bold text-white">{account.currency}</Text>
          </View>
        </View>
        <View>
          <Text className="text-white text-lg">Ukupno raspolozivo stanje</Text>
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
      </Pressable>
    </Animated.View>
  );
}
