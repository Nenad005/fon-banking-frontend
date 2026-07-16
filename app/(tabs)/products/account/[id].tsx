import ContentHeader from "@/components/content-header";
import RecentTransactions from "@/components/home/recent-transactions";
import AccountProductItem from "@/components/products/account-product-item";
import { Text } from "@/components/text";
import { useBankingData } from "@/hooks/useBankingData";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
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

const addSerbianDiacritics = (value: string) =>
  value
    .replace(/TEKUCI/g, "TEKUĆI")
    .replace(/Tekuci/g, "Tekući")
    .replace(/RACUN/g, "RAČUN")
    .replace(/Racun/g, "Račun")
    .replace(/racun/g, "račun");

const formatSectionTitle = (title: string) => {
  const normalized = addSerbianDiacritics(
    title.toLocaleLowerCase("sr-Latn-RS"),
  );
  return (
    normalized.charAt(0).toLocaleUpperCase("sr-Latn-RS") + normalized.slice(1)
  );
};

export default function AccountDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { accounts, transactions, isLoading, errorMessage } = useBankingData();
  const account = accounts.find((entry) => entry.accountId === id);
  const accountTransactions = account
    ? transactions.filter(
        (transaction) =>
          transaction.senderAccount === account.accountId ||
          transaction.recipientAccount === account.accountId,
      )
    : [];
  const selectedAccountIds = new Set(account ? [account.accountId] : []);

  if (isLoading && accounts.length === 0) {
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
        title="Detalji računa"
        subtitle="Pregled podataka i podešavanja računa"
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

        {account ? (
          <>
            <Text className="pb-5 text-2xl text-cgray">
              {formatSectionTitle(account.title)}
            </Text>
            <AccountProductItem account={account} />

            <View className="pb-7 pt-7">
              <View className="flex-row items-center justify-between pb-4">
                <Text className="text-2xl text-cgray">Podešavanja limita</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Izmeni limite računa"
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
                      {formatAmount(limit.amount)} {account.currency}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <RecentTransactions
              transactions={accountTransactions}
              accountIds={selectedAccountIds}
              limit={3}
            />
          </>
        ) : (
          <Text className="text-cgray">Nema podataka za izabrani račun.</Text>
        )}
      </ScrollView>
    </View>
  );
}
