import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function CardDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, isLoading } = useBankingData();
  const card = cards.find((entry) => entry.cardId === id);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-14 px-5">
      <ContentHeader
        title={card ? `${card.cardType} kartica` : "Kartica"}
        subtitle={card?.accountId ?? "Kartica nije pronadjena"}
        className="border-0 pb-7"
      />
      {card ? (
        <View className="gap-3">
          <Text className="text-cgray text-lg">{card.ownerName}</Text>
          <Text className="text-cblue text-3xl font-inconsolata-extrabold">
            **** **** **** {card.cardId.slice(-4)}
          </Text>
          <Text className="text-cgray">Valuta: {card.currency}</Text>
        </View>
      ) : (
        <Text className="text-cgray">Nema podataka za izabranu karticu.</Text>
      )}
    </View>
  );
}
