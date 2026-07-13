import QuickPayments from "@/components/home/quick-payments";
import { Text } from "@/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useBankingData } from "@/hooks/useBankingData";
import { cn } from "@/lib/utils";
import { openQrScanner } from "@/lib/qr-scanner-navigation";

type PaymentFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  className?: string;
  keyboardType?: "default" | "numeric";
};

function PaymentField({
  placeholder,
  value,
  onChangeText,
  className = "",
  keyboardType = "default",
}: PaymentFieldProps) {
  const hasText = value !== ""

  return (
    <View>
      <Text className={cn(
        "absolute top-3 text-[#8c8c8c] text-xl left-2 ease-in-out transition-all",
        hasText && "translate-y-[-20px] text-base left-0")}>
          {placeholder}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className={`h-10 border-b border-cgray pb-0 font-inria-regular text-xl text-cgray ${className}`}
      />
    </View>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [model, setModel] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [purpose, setPurpose] = useState("");

  const { accounts, accountIds, transactions } = useBankingData();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>((accounts && accounts.length > 0 ) ? accounts[0].accountId : null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const selectedAccount =
    accounts.find((account) => account.accountId === selectedAccountId) ?? accounts[0];

  return (
    <View className="flex-1 bg-white pt-14">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-start justify-between pb-11">
          <View>
            <Text className="text-3xl leading-9 text-black">
              Brzo i sigurno plaćanje.
            </Text>
            <Text className="font-inria-light text-lg text-cgray">
              Izaberi šablon ili popuni podatke ispod.
            </Text>
          </View>
          <Pressable
            className="mt-1 h-[50px] w-[50px] items-center justify-center rounded-[18px] border-[3px] border-ctirquise"
            onPress={() => openQrScanner(router, setRecipientAccount)}>
            <MaterialIcons name="qr-code-scanner" size={30} color="#004B7C" />
          </Pressable>
        </View>

        <QuickPayments
                    className="pb-10"
                    transactions={transactions}
                    accountIds={accountIds}
                  />

        <Text className="pb-10 text-2xl font-inria-bold text-black">
          SA RAČUNA
        </Text>
        <View className="relative mb-14">
          <Pressable
            className="flex-row items-end justify-between border-b border-cgray pb-1"
            disabled={accounts.length === 0}
            onPress={() => setIsAccountMenuOpen((isOpen) => !isOpen)}>
            <View>
              <Text className="text-xl text-[#929292]">RAČUN</Text>
              <Text className="text-xl text-cgray">
                {selectedAccount?.accountId ?? "IZABERITE RAUN"}
              </Text>
              {selectedAccount && (
                <Text className="pt-1 text-lg text-cgray">
                  {selectedAccount.title}
                </Text>
              )}
            </View>
            <Ionicons
              name={"chevron-down"}
              size={30}
              color="#505050"
              className={cn("ease-in-out transition-all", isAccountMenuOpen && "rotate-180" )}
            />
          </Pressable>

          {isAccountMenuOpen && (
            <View className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-cgray bg-white">
            {accounts.map((account) => (
              <Pressable
                key={account.accountId}
                className="border-b border-[#e5e5e5] px-4 py-3 last:border-b-0"
                onPress={() => {
                  setSelectedAccountId(account.accountId);
                  setIsAccountMenuOpen(false);
                }}>
                <Text className="text-xl text-cgray">{account.accountId}</Text>
                <Text className="pt-1 text-base text-[#929292]">{account.title}</Text>
              </Pressable>
            ))}
            </View>
          )}
        </View>

        <Text className="pb-8 text-2xl font-inria-bold text-black">
          PRIMALAC
        </Text>
        <View className="gap-5 pb-14">
          <PaymentField
            placeholder="NAZIV PRIMAOCA"
            value={recipientName}
            onChangeText={setRecipientName}
          />
          <PaymentField
            placeholder="BROJ RAČUNA"
            value={recipientAccount}
            onChangeText={setRecipientAccount}
            keyboardType="default"
          />
          <PaymentField 
            placeholder="MODEL" 
            value={model} 
            onChangeText={setModel} 
            keyboardType="numeric"/>
          <PaymentField
            placeholder="POZIV NA BROJ"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
          />
        </View>

        <Text className="pb-8 text-2xl font-inria-bold text-black">
          DETALJI TRANSAKCIJE
        </Text>
        <View className="gap-5 pb-10">
          <View className="flex-row items-end">
            <PaymentField
              placeholder="IZNOS"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="flex-1 w-60"
            />
            <Text className="pl-3 text-2xl font-inria-bold text-cgray">{selectedAccount && selectedAccount.currency}</Text>
          </View>
          <PaymentField
            placeholder="ŠIFRA PLAĆANJA"
            value={paymentCode}
            onChangeText={setPaymentCode}
            keyboardType="numeric"
          />
          <PaymentField
            placeholder="SVRHA PLAĆANJA"
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>

        <Pressable className="flex-row items-center justify-center gap-3 rounded-2xl bg-ccyan py-4">
          <Text className="text-2xl font-inria-bold text-white">Plati</Text>
          <Ionicons name="arrow-forward" size={25} color="white" />
        </Pressable>
      </ScrollView>
    </View>
  );
}
