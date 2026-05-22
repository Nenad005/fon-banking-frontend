import { Text } from "@/components/text";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useRef } from "react";
import { Pressable, TextInput, View } from "react-native";

export default function PinInput({
  code,
  setCode,
  isCodeReady,
  setIsCodeReady,
}: {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  isCodeReady: boolean;
  setIsCodeReady: Dispatch<SetStateAction<boolean>>;
}) {
  const InputRef = useRef<TextInput>(null);

  const handleChangeCode = (input: string) => {
    const numeric = input.replace(/[^0-9]/g, "");

    if (numeric.length === 4) {
      InputRef.current?.blur();
      setIsCodeReady(true);
    } else {
      setIsCodeReady(false);
    }

    setCode(numeric.slice(0, 4));
  };

  const focusInput = () => {
    // FIX: If the keyboard was closed with the back button, the input is technically still "focused".
    // We force a blur and refocus to wake the keyboard back up.
    if (InputRef.current?.isFocused()) {
      InputRef.current.blur();
      setTimeout(() => {
        InputRef.current?.focus();
      }, 100);
    } else {
      InputRef.current?.focus();
    }
  };

  return (
    <View className="border-solid border-red-300 border-0 flex items-center relative py-4 mt-28">
      <Pressable onPress={focusInput} className="flex flex-row gap-2">
        {[0, 1, 2, 3].map((index) => {
          const isFilled = code.length > index;

          return (
            <View
              key={index}
              className={cn(
                "w-14 h-14 border-2 border-solid rounded-lg items-center justify-center",
                isFilled ? "border-cmagenta" : "border-gray-400",
              )}
            >
              {isFilled && <Text className="text-5xl text-center pt-2">*</Text>}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        value={code}
        ref={InputRef}
        onChangeText={handleChangeCode}
        keyboardType="number-pad"
        maxLength={4}
        caretHidden={true} // krije cursor
        className="absolute opacity-0 w-0 h-0"
        pointerEvents="none"
      />

      <View className="mt-2">
        <Text className="font-inter text-cgray">Unesite vas PIN</Text>
      </View>
    </View>
  );
}
