import ContentHeader from "@/components/content-header";
import AdditionalAuthConfirmation from "@/components/auth/additional-auth-confirmation";
import RecentTransactions from "@/components/home/recent-transactions";
import CardDetailsItem from "@/components/products/card-details-item";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from "react-native";

const LIMITS = [
  { label: "Dnevni limit", amount: 5_000 },
  { label: "Nedeljni limit", amount: 30_000 },
  { label: "Mesečni limit", amount: 100_000 },
];

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("sr-Latn-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export default function CardDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, transactions, accountIds, isLoading, errorMessage } =
    useBankingData();
  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false);
  const [isAuthConfirmationVisible, setIsAuthConfirmationVisible] =
    useState(false);
  const card = cards.find((entry) => entry.cardId === id);
  const cardTransactions = card
    ? transactions.filter(
        (transaction) => transaction.cardNumber === card.cardId,
      )
    : [];

  if (isLoading && cards.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#004B7C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-14">
      <StatusBar barStyle="dark-content" />
      <ContentHeader
        title="Detalji kartice"
        subtitle="Pregled podataka i podešavanja kartice"
        className="border-0 px-5 pb-7"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 28,
        }}
      >
        {errorMessage ? (
          <Text className="pb-5 text-red-600">{errorMessage}</Text>
        ) : null}

        {card ? (
          <>
            <Text className="pb-5 text-2xl text-cgray">
              {card.cardType} kartica
            </Text>
            <CardDetailsItem
              card={card}
              showSensitiveDetails={showSensitiveDetails}
              onToggleSensitiveDetails={() => {
                if (showSensitiveDetails) {
                  setShowSensitiveDetails(false);
                } else {
                  setIsAuthConfirmationVisible(true);
                }
              }}
            />

            <View className="pb-7 pt-7">
              <View className="flex-row items-center justify-between pb-4">
                <Text className="text-2xl text-cgray">Podešavanja limita</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Izmeni limite kartice"
                  hitSlop={8}
                >
                  <MaterialIcons name="edit" size={28} color="#505050" />
                </Pressable>
              </View>

              <View className="gap-4 px-2">
                {LIMITS.map((limit) => (
                  <View
                    key={limit.label}
                    className="flex-row items-center justify-between"
                  >
                    <Text className="font-inria-light text-lg text-cgray">
                      {limit.label} :
                    </Text>
                    <Text className="text-2xl text-ctirquise">
                      {formatAmount(limit.amount)} {card.currency}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <RecentTransactions
              transactions={cardTransactions}
              accountIds={accountIds}
              limit={3}
            />
          </>
        ) : (
          <Text className="text-cgray">Nema podataka za izabranu karticu.</Text>
        )}
      </ScrollView>
      <AdditionalAuthConfirmation
        visible={isAuthConfirmationVisible}
        title="Prikažite podatke kartice"
        description="Radi zaštite vaših podataka, potvrdite identitet pre prikazivanja broja kartice i CVV koda."
        confirmLabel="Prikaži"
        onCancel={() => setIsAuthConfirmationVisible(false)}
        onConfirmed={() => {
          setShowSensitiveDetails(true);
          setIsAuthConfirmationVisible(false);
        }}
      />
    </View>
  );
}
