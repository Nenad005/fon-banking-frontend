import ContentHeader from "@/components/content-header";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AccountDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accounts, isLoading } = useBankingData();
  const account = accounts.find((entry) => entry.accountId === id);

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
        title={account?.title ?? "Racun"}
        subtitle={account?.accountId ?? "Racun nije pronadjen"}
        className="border-0 pb-7"
      />
      {account ? (
        <View className="gap-3">
          <Text className="text-cgray text-lg">{account.name}</Text>
          <Text className="text-cblue text-4xl font-inconsolata-extrabold">
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(account.balance)} {account.currency}
          </Text>
        </View>
      ) : (
        <Text className="text-cgray">Nema podataka za izabrani racun.</Text>
      )}
    </View>
  );
}
