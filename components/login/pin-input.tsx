import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button, TextInput, View } from "react-native";

export default function PinInput() {
  const [code, setCode] = useState<string>("");
  const [isCodeReady, setIsCodeReady] = useState(false);
  const InputRef = useRef<TextInput>(null);
  let kodovi = Array.from(code);
  console.log(kodovi);

  const handleChangeCode = (input: string) => {
    const numeric = input.replace(/[^0-9]/g, "");
    if (numeric.length == 4) {
      InputRef.current?.blur();
      setIsCodeReady(true);
    } else {
      setIsCodeReady(false);
    }
    setCode(numeric.slice(0, 4));
  };

  const DigitBox = ({ index }: { index: number }) => {
    const isFilled = kodovi.length > index;

    return (
      <View
        className={cn(
          "w-14 h-14 border-2 border-solid border-magenta rounded-lg items-center justify-center",
          isFilled ? "border-magenta" : "border-gray-400",
        )}
      >
        {isFilled && <Text className="text-5xl text-center pt-2">*</Text>}
      </View>
    );
  };

  return (
    <View className="border-solid border-red-300 border-2 flex items-center">
      <View className="flex flex-row gap-2">
        <DigitBox index={0}></DigitBox>
        <DigitBox index={1}></DigitBox>
        <DigitBox index={2}></DigitBox>
        <DigitBox index={3}></DigitBox>
      </View>
      <TextInput
        value={code}
        ref={InputRef}
        onChangeText={handleChangeCode}
        keyboardType="number-pad"
      ></TextInput>
      <Button
        title="Test"
        disabled={!isCodeReady}
        onPress={() => {
          InputRef.current?.blur();
        }}
      ></Button>
    </View>
  );
}
