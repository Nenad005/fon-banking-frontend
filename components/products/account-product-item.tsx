import { Text } from "@/components/text";
import { Account } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import { AccountNumber } from "@/lib/account-number";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { Animated, GestureResponderEvent, Pressable, View } from "react-native";

export default function AccountProductItem({
  account,
  onPress,
}: {
  account: Account;
  onPress?: () => void;
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
  const accountColor =
    colorClassNames[account.color] ?? colorClassNames.magenta;

  const formattedBalance = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(account.balance);

  const formattedId = new AccountNumber(account.accountId).format();

  const animationRef = useRef<LottieView>(null);

  const handleCopyPress = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    animationRef.current?.play();
    await Clipboard.setStringAsync(account.accountId);
  };

  return (
    <Animated.View className={cn("w-full")}>
      <Pressable
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={
          onPress ? `Otvori račun ${account.accountId}` : undefined
        }
        onPress={onPress}
        className={cn(
          "aspect-[2.7] overflow-hidden rounded-3xl p-4",
          accountColor.background,
        )}
      >
        <View className="absolute bottom-[-10px] right-[-30px] rotate-[20deg]">
          <FontAwesome name="bank" size={120} className={accountColor.icon} />
        </View>
        <View className="flex-row items-start justify-between">
          <Text className="text-xl uppercase text-white">{account.title}</Text>
          <View className="rounded-full bg-black/15 px-3 py-1">
            <Text className="font-inria-bold text-white">{account.currency}</Text>
          </View>
        </View>
        <View className="mt-auto">
          <View className="flex-row items-end gap-2">
            <Text className="font-inconsolata-extrabold text-5xl text-cyellow">
              {formattedBalance}
            </Text>
            <Text className="font-inria-bold text-2xl text-cyellow">
              {account.currency}
            </Text>
          </View>
        </View>
        <View className="flex-row items-end gap-1">
          <Text className="text-white">{formattedId}</Text>
          <Pressable className="h-fit" hitSlop={8} onPress={handleCopyPress}>
            <LottieView
              ref={animationRef}
              source={require("@/assets/lottie/Checkmark.json")}
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
