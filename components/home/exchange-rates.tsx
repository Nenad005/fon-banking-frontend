import { Currency } from "@/lib/currency";
import { Text } from "@/components/text";
import { useApi } from "@/context/useApi";
import { cn } from "@/lib/utils";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

const FLAG_CDN_URL = "https://flagcdn.com/w80/";

type ExchangeRate = {
  base: Currency;
  quote: Currency;
  name: string;
  countryCode: string;
  date: string;
  buy: number;
  middle: number;
  sell: number;
};

type ExchangeRateResponse = {
  base: Currency;
  rates: ExchangeRate[];
};

function CountryFlag({
  countryCode,
  size = 22,
}: {
  countryCode: string;
  size?: number;
}) {
  return (
    <Image
      source={{ uri: `${FLAG_CDN_URL}${countryCode}.png` }}
      style={{ width: size * 1.6, height: size }}
      className="rounded-md"
      resizeMode="contain"
    />
  );
}

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export default function ExchangeRates({
  className = "",
  base,
  quoutes,
}: {
  className?: string;
  base: Currency;
  quoutes: Currency[];
}) {
  const api = useApi();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadRates = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await api.get<ExchangeRateResponse>(
          "/exchange-rates",
          {
            params: { base },
          },
        );

        if (!isActive) return;
        setRates(response.data.rates);
      } catch {
        if (isActive) setErrorMessage("Kursna lista trenutno nije dostupna.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadRates();
    return () => {
      isActive = false;
    };
  }, [api, base]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
      />
    ),
    [],
  );

  const visibleRates = rates.filter((rate) => quoutes.includes(rate.quote));

  return (
    <View className={cn("pb-9", className)}>
      <View className="flex-row items-end justify-between">
        <Text className="text-2xl text-cgray">Kursna lista</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prikaži sve podržane valute"
          hitSlop={10}
          onPress={() => bottomSheetRef.current?.present()}
        >
          <Text className="pb-1 font-inter text-[14px] font-medium text-ctirquise">
            Prikaži sve
          </Text>
        </Pressable>
      </View>

      <View className="gap-3 pt-5">
        <RateHeader />

        {isLoading ? <ActivityIndicator className="my-8" /> : null}
        {errorMessage ? (
          <Text className="py-6 text-center text-cgray">{errorMessage}</Text>
        ) : null}
        {visibleRates.map((rate) => (
          <RateRow key={rate.quote} rate={rate} />
        ))}
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderRadius: 32 }}
        enableDynamicSizing={false}
        handleIndicatorStyle={{ width: 48, backgroundColor: "#d1d5db" }}
        snapPoints={["75%"]}
      >
        <View className="px-5 pb-4 pt-1">
          <Text className="text-2xl text-cgray">Kompletna kursna lista</Text>
          <Text className="pt-1 font-inria-light text-base text-cgray">
            Kupovni, srednji i prodajni kurs
          </Text>
        </View>
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}
        >
          <RateHeader />
          {isLoading ? <ActivityIndicator className="my-8" /> : null}
          {errorMessage ? (
            <Text className="py-6 text-center text-cgray">{errorMessage}</Text>
          ) : null}
          {rates.map((rate) => (
            <RateRow key={rate.quote} rate={rate} />
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

function RateHeader() {
  return (
    <View className="w-full flex-row pb-5 pt-2">
      <Text className="w-[40%] text-lg text-cmagenta">Valuta</Text>
      <Text className="w-[20%] text-center text-lg text-cmagenta">Kupovni</Text>
      <Text className="w-[20%] text-center text-lg text-cmagenta">Srednji</Text>
      <Text className="w-[20%] text-center text-lg text-cmagenta">
        Prodajni
      </Text>
    </View>
  );
}

function RateRow({ rate }: { rate: ExchangeRate }) {
  return (
    <View className="w-full flex-row items-center pb-5">
      <View className="w-[40%] flex-row items-center">
        <CountryFlag countryCode={rate.countryCode} />
        <Text className="mx-auto pr-7 font-inria-bold text-lg">
          {rate.quote}
        </Text>
      </View>
      <Text className="w-[20%] text-center text-[13px] text-cgray">
        {formatter.format(rate.buy)}
      </Text>
      <Text className="w-[20%] text-center text-[13px] text-cgray">
        {formatter.format(rate.middle)}
      </Text>
      <Text className="w-[20%] text-center text-[13px] text-cgray">
        {formatter.format(rate.sell)}
      </Text>
    </View>
  );
}
