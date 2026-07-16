import { Text } from "@/components/text";
import { Card } from "@/hooks/useBankingData";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, View } from "react-native";

const formatAccountId = (accountId: string) =>
  accountId.replace("-", "").replace(/(.{4})(?=.)/g, "$1 ");

const formatCardNumber = (cardId: string, showSensitiveDetails: boolean) => {
  const visibleCardId = showSensitiveDetails
    ? cardId
    : `${"*".repeat(Math.max(0, cardId.length - 4))}${cardId.slice(-4)}`;

  return visibleCardId.match(/.{1,4}/g) ?? [visibleCardId];
};

export default function CardDetailsItem({
  card,
  showSensitiveDetails,
  onToggleSensitiveDetails,
}: {
  card: Card;
  showSensitiveDetails: boolean;
  onToggleSensitiveDetails: () => void;
}) {
  const cardNumberSections = formatCardNumber(
    card.cardId,
    showSensitiveDetails,
  );
  const expireDate = new Date(card.expireDate);
  const month = (expireDate.getMonth() + 1).toString().padStart(2, "0");
  const year = expireDate.getFullYear().toString().slice(-2);

  return (
    <View className="relative aspect-[1.6] justify-between rounded-3xl p-4">
      <View className="absolute inset-0 overflow-hidden rounded-3xl">
        <LinearGradient
          className="h-full w-full"
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
          <View className="flex-row items-center gap-2">
            <Image
              source={require("@/assets/images/FON-Logo.svg")}
              style={{ width: 35, height: 35 }}
            />
            <Text className="font-dangrek text-3xl text-white">
              FON <Text className="font-darling text-4xl">kartica</Text>
            </Text>
          </View>
          <Text className="text-white">{formatAccountId(card.accountId)}</Text>
        </View>

        <View className="flex-row items-start gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showSensitiveDetails
                ? "Sakrij podatke kartice"
                : "Prikaži podatke kartice"
            }
            accessibilityState={{ expanded: showSensitiveDetails }}
            className="h-9 w-9 items-center justify-center rounded-full bg-black/15"
            hitSlop={6}
            onPress={onToggleSensitiveDetails}
          >
            <Ionicons
              name={showSensitiveDetails ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="white"
            />
          </Pressable>
          <Image
            source={require("@/assets/images/card-nfc.svg")}
            style={{ width: 35, height: 35 }}
          />
        </View>
      </View>

      <View className="flex-row items-end justify-between">
        <View>
          <View className="flex-row gap-2">
            {cardNumberSections.map((section, index) => (
              <Text
                className="text-[21px] tracking-wide text-white"
                key={`${section}-${index}`}
              >
                {section}
              </Text>
            ))}
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-[15px] text-white">
              {showSensitiveDetails ? month : "**"}/{year}
            </Text>
            <Text className="text-[13px] text-white/80">
              CVV {showSensitiveDetails ? card.cvv : "***"}
            </Text>
          </View>
          <Text className="text-white">{card.ownerName}</Text>
        </View>

        <Image
          source={
            card.cardType === "Master"
              ? require("@/assets/images/mastercard-logo.svg")
              : require("@/assets/images/visa-logo.svg")
          }
          style={
            card.cardType === "Master"
              ? { height: 35, aspectRatio: 1.42 }
              : { height: 24, aspectRatio: 3.2 }
          }
        />
      </View>
    </View>
  );
}
