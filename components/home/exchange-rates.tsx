import {
  Currency,
  eurExchangeRates,
  rsdExchangeRates,
} from "@/assets/data/homePageData";
import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { Image, View } from "react-native";

const FLAG_CDN_URL = "https://flagcdn.com/w80/";
const FORMAT = ".png";

interface CountryFlagProps {
  isoCode: string;
  size: number;
  className?: string;
}

const CountryFlag = ({ isoCode, size, className }: CountryFlagProps) => {
  return (
    <Image
      source={{ uri: FLAG_CDN_URL + isoCode.toLocaleLowerCase() + FORMAT }}
      style={{ width: size * 1.6, height: size }}
      className={cn("", className)}
      resizeMode="contain"
    />
  );
};

export default function ExhangeRates({
  className = "",
  base,
  quoutes,
}: {
  className?: string;
  base: Currency;
  quoutes: Currency[];
}) {
  const exchangeRates = base == "RSD" ? rsdExchangeRates : eurExchangeRates;
  const filteredExchangeRates = exchangeRates.filter((rate) => {
    return quoutes.includes(rate.quote);
  });

  console.log(filteredExchangeRates);

  return (
    <View className={cn("pb-9", className)}>
      <View className="flex-row justify-between items-end ">
        <Text className="text-cgray text-2xl">Kursna lista</Text>
        <Text className="text-ctirquise font-inter font-medium text-[14px] pb-1">
          Prikazi sve
        </Text>
      </View>
      <View className="gap-3 pt-5">
        <View className="flex-row w-full">
          <View className="w-[40%] bg-red-">
            <Text className="text-cen text-cmagenta text-lg">Valuta</Text>
          </View>
          <Text className="text-center w-[20%] bg-red- text-cmagenta text-lg">
            Kupovni
          </Text>
          <Text className="text-center w-[20%] bg-red- text-cmagenta text-lg">
            Srednji
          </Text>
          <Text className="text-center w-[20%] bg-red- text-cmagenta text-lg">
            Prodajni
          </Text>
        </View>
        {filteredExchangeRates.map((rate, index) => {
          const baseRate = 1 / rate.rate;
          const buyPrice = Math.floor(baseRate * 0.95 * 100) / 100;
          const sellPrice = Math.floor(baseRate * 1.05 * 100) / 100;

          const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          });

          return (
            <View
              className="flex-row w-full items-center pb-5"
              key={rate.quote + index}
            >
              <View className="w-[40%] flex-row items-center">
                <View className="flex justify-center items-center">
                  <CountryFlag
                    isoCode={rate.quote.slice(0, 2).toLowerCase()}
                    size={22}
                    className="rounded-md"
                  />
                </View>
                <Text className="mx-auto text-lg pr-7 font-inria-bold">
                  {rate.quote}
                </Text>
              </View>
              <Text className="text-center w-[20%] text-[13px] text-cgray">
                {formatter.format(buyPrice)}
              </Text>
              <Text className="text-center w-[20%] text-[13px] text-cgray">
                {formatter.format(baseRate)}
              </Text>
              <Text className="text-center w-[20%] text-[13px] text-cgray">
                {formatter.format(sellPrice)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
