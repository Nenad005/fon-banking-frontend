import { Text } from "@/components/text";
import { useApi } from "@/context/useApi";
import { AccountNumber } from "@/lib/account-number";
import {
  buildNbsQrText,
  isSuccessfulNbsResponse,
  nbsErrorMessage,
  NbsQrResponse,
} from "@/lib/nbs-ips-qr";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function QrCodePage() {
  const router = useRouter();
  const api = useApi();
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    recipientName?: string | string[];
    recipientAccount?: string | string[];
  }>();
  const recipientName = firstParam(params.recipientName) ?? "";
  const recipientAccount = firstParam(params.recipientAccount) ?? "";
  const [amount, setAmount] = useState("");
  const [paymentCode, setPaymentCode] = useState("289");
  const [purpose, setPurpose] = useState("");
  const [model, setModel] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [response, setResponse] = useState<NbsQrResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isGenerated = isSuccessfulNbsResponse(response ?? {}) && Boolean(response?.i);
  const fields = response?.n;
  const qrSize = Math.min(width - 100, 300);

  const closePage = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/products");
  };

  const generateQr = async () => {
    const parsedAmount = Number(amount.replace(",", "."));

    if (!recipientName || !recipientAccount) {
      Alert.alert("Nedostaju podaci", "Podaci izabranog računa nisu dostupni.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Neispravan iznos", "Unesite iznos veći od nule.");
      return;
    }

    if (!paymentCode.trim() || !purpose.trim()) {
      Alert.alert("Nedostaju podaci", "Unesite šifru i svrhu plaćanja.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const qrText = buildNbsQrText({
        recipientName,
        recipientAccount,
        amount,
        paymentCode,
        purpose,
        model,
        referenceNumber,
      });
      const result = await api.post<NbsQrResponse>("/qr/generate", { text: qrText });

      if (!isSuccessfulNbsResponse(result.data) || !result.data.i) {
        setErrorMessage(nbsErrorMessage(result.data));
        return;
      }

      setResponse(result.data);
    } catch (error) {
      setErrorMessage(
        isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? error.message
          : "QR kod trenutno nije moguće generisati.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black/35">
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={["78%"]}
        enableDynamicSizing={false}
        enableContentPanningGesture={false}
        enableHandlePanningGesture
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onClose={closePage}
        backgroundStyle={{ backgroundColor: "#f4f7f8", borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: "#9ca8ad", width: 42 }}>
        <View className="flex-row items-center justify-between px-5 pb-3">
          <Pressable
            accessibilityLabel="Zatvori NBS IPS QR"
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            onPress={closePage}>
            <Ionicons name="close" size={28} color="#004B7C" />
          </Pressable>
          <Text className="text-xl font-inria-bold text-ctirquise">NBS IPS QR</Text>
          <View className="h-12 w-12" />
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
        {isGenerated ? (
          <>
            <View className="items-center rounded-[28px] bg-white px-5 py-8">
              <Text className="text-center text-3xl font-inria-bold text-black">
                QR kod za plaćanje
              </Text>
              <Text className="pt-2 text-center text-lg text-cgray">
                Skeniranjem se priprema platni nalog. Proverite podatke pre plaćanja.
              </Text>
              <View className="my-7 rounded-2xl border border-[#dce5e9] bg-white p-3">
                <Image
                  accessibilityLabel="Generisani NBS IPS QR kod"
                  source={{ uri: `data:image/png;base64,${response?.i}` }}
                  style={{ width: qrSize, height: qrSize }}
                />
              </View>
              <View className="rounded-full bg-ctirquise px-5 py-2">
                <Text className="font-inria-bold text-white">NBS IPS QR</Text>
              </View>
            </View>

            {fields ? (
              <View className="mt-5 rounded-[24px] bg-white p-5">
                <Text className="pb-4 text-xl font-inria-bold text-black">Podaci naloga</Text>
                <QrDetail label="Primalac" value={fields.N} />
                <QrDetail
                  label="Račun"
                  value={
                    fields.R ? new AccountNumber(fields.R).format() : undefined
                  }
                />
                <QrDetail label="Iznos" value={fields.I} />
                <QrDetail label="Šifra plaćanja" value={fields.SF} />
                <QrDetail label="Svrha" value={fields.S} />
                <QrDetail label="Model i poziv na broj" value={fields.RO} isLast />
              </View>
            ) : null}

            <Pressable
              className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-white py-4"
              onPress={() => setResponse(null)}>
              <MaterialIcons name="edit" size={22} color="#004B7C" />
              <Text className="text-lg font-inria-bold text-ctirquise">Izmeni podatke</Text>
            </Pressable>
          </>
        ) : (
          <View className="rounded-[28px] bg-white p-6">
            <View className="items-center pb-6">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-ctirquise/10">
                <MaterialIcons name="qr-code-2" size={32} color="#004B7C" />
              </View>
              <Text className="pt-4 text-center text-3xl font-inria-bold text-black">
                Kreiraj zahtev za uplatu
              </Text>
              <Text className="pt-2 text-center text-lg text-cgray">
                QR kod će uplatiti sredstva na{" "}
                {new AccountNumber(recipientAccount).format()}.
              </Text>
            </View>

            {errorMessage ? (
              <View className="mb-5 rounded-2xl bg-[#fff1f1] p-4">
                <Text className="font-inria-bold text-[#9d2525]">QR kod nije generisan</Text>
                <Text className="pt-1 text-[#6f3030]">{errorMessage}</Text>
              </View>
            ) : null}

            <QrInput
              label="Iznos (RSD)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <QrInput
              label="Šifra plaćanja"
              value={paymentCode}
              onChangeText={setPaymentCode}
              keyboardType="number-pad"
            />
            <QrInput label="Svrha plaćanja" value={purpose} onChangeText={setPurpose} />
            <View className="flex-row gap-4">
              <View className="w-24">
                <QrInput
                  label="Model"
                  value={model}
                  onChangeText={setModel}
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <QrInput
                  label="Poziv na broj"
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                />
              </View>
            </View>

            <Pressable
              className="mt-2 flex-row items-center justify-center gap-3 rounded-2xl bg-ctirquise py-4"
              disabled={isLoading}
              onPress={() => void generateQr()}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <MaterialIcons name="qr-code-2" size={25} color="white" />
              )}
              <Text className="text-xl font-inria-bold text-white">
                {isLoading ? "NBS proverava podatke..." : "Generiši QR kod"}
              </Text>
            </Pressable>
          </View>
        )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function QrInput({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
}) {
  return (
    <View className="mb-4">
      <Text className="pb-1 text-base text-[#737373]">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="rounded-xl border border-[#ccdadd] bg-[#fbfcfc] px-4 py-3 font-inria-regular text-lg text-cgray"
      />
    </View>
  );
}

function QrDetail({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value?: string;
  isLast?: boolean;
}) {
  if (!value) return null;

  return (
    <View className={isLast ? "py-3" : "border-b border-[#e4e9eb] py-3"}>
      <Text className="text-base text-[#858585]">{label}</Text>
      <Text className="pt-1 text-lg text-cgray">{value}</Text>
    </View>
  );
}
