import { Text } from "@/components/text";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import type { TextInput as GestureHandlerTextInput } from "react-native-gesture-handler";

type AdditionalAuthConfirmationProps = {
  visible: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirmed: () => void | Promise<void>;
};

const AUTH_SHEET_SNAP_POINTS = ["38%", "80%"];

export default function AdditionalAuthConfirmation({
  visible,
  title = "Potvrdite identitet",
  description,
  confirmLabel = "Potvrdi",
  onCancel,
  onConfirmed,
}: AdditionalAuthConfirmationProps) {
  const { confirmPin } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<GestureHandlerTextInput | undefined>(null);
  const isPresentedRef = useRef(false);
  const didAutoFocusRef = useRef(false);
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible && !isPresentedRef.current) {
      isPresentedRef.current = true;
      didAutoFocusRef.current = false;
      requestAnimationFrame(() => bottomSheetRef.current?.present());
    } else if (!visible && isPresentedRef.current) {
      isPresentedRef.current = false;
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const focusInput = () => {
    if (inputRef.current?.isFocused()) {
      inputRef.current.blur();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      inputRef.current?.focus();
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, "").slice(0, 4));
    setErrorMessage(null);
  };

  const handleDismiss = () => {
    isPresentedRef.current = false;
    didAutoFocusRef.current = false;
    setPin("");
    setErrorMessage(null);
    setIsSubmitting(false);
    onCancel();
  };

  const handleConfirm = async () => {
    if (pin.length !== 4 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const isConfirmed = await confirmPin(pin);

      if (isConfirmed) await onConfirmed();
    } catch (error) {
      setPin("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Potvrda identiteta nije uspela.",
      );
      focusInput();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior={isSubmitting ? "none" : "close"}
      />
    ),
    [isSubmitting],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ borderRadius: 32 }}
      enableBlurKeyboardOnGesture
      enableDynamicSizing={false}
      enablePanDownToClose={!isSubmitting}
      handleIndicatorStyle={{ width: 48, backgroundColor: "#d1d5db" }}
      snapPoints={AUTH_SHEET_SNAP_POINTS}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      onChange={(index) => {
        if (index >= 0 && !didAutoFocusRef.current) {
          didAutoFocusRef.current = true;
          setTimeout(focusInput, 150);
        }
      }}
      onDismiss={handleDismiss}
    >
      <BottomSheetView className="px-5 pb-8">
        <View className="flex-row items-start gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-ctirquise/10">
            <Ionicons
              name="shield-checkmark-outline"
              size={26}
              color="#004B7C"
            />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-2xl text-cgray">{title}</Text>
            <Text className="pt-1 font-inria-light text-base text-cgray">
              {description}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zatvori"
            disabled={isSubmitting}
            hitSlop={10}
            onPress={() => bottomSheetRef.current?.dismiss()}
          >
            <Ionicons name="close" size={25} color="#505050" />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Unesite četvorocifreni PIN"
          className="mt-7 flex-row justify-center gap-3"
          onPress={focusInput}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;

            return (
              <View
                key={index}
                className={cn(
                  "h-12 w-12 items-center justify-center rounded-xl border-2",
                  isFilled ? "border-cmagenta" : "border-gray-300",
                )}
              >
                {isFilled ? (
                  <View className="h-3 w-3 rounded-full bg-cmagenta" />
                ) : null}
              </View>
            );
          })}
        </Pressable>

        <BottomSheetTextInput
          ref={inputRef}
          value={pin}
          accessibilityLabel="PIN"
          autoComplete="off"
          caretHidden
          keyboardType="number-pad"
          maxLength={4}
          pointerEvents="none"
          style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
          onChangeText={handlePinChange}
          onSubmitEditing={() => void handleConfirm()}
        />

        <Text className="pt-2 text-center font-inria-light text-sm text-cgray">
          Unesite svoj četvorocifreni PIN
        </Text>

        {errorMessage ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2"
          >
            <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
            <Text className="flex-1 text-sm text-red-600">{errorMessage}</Text>
          </View>
        ) : null}

        <View className="mt-6 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            className="flex-1 items-center rounded-xl border border-gray-300 py-3"
            onPress={() => bottomSheetRef.current?.dismiss()}
          >
            <Text className="text-lg text-cgray">Otkaži</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={pin.length !== 4 || isSubmitting}
            className={cn(
              "flex-1 items-center rounded-xl bg-ccyan py-3",
              (pin.length !== 4 || isSubmitting) && "bg-ccyan/50",
            )}
            onPress={() => void handleConfirm()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-inria-bold text-lg text-white">
                {confirmLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
