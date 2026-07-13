import { Text } from "@/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BarcodeScanningResult,
  CameraView,
  scanFromURLAsync,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FRAME_SIZE = 256;
const DIM_COLOR = "rgba(0, 0, 0, 0.6)";

type QrScannerProps = {
  onClose: () => void;
  onScanned: (scannedValue: string) => void;
};

export default function QrScanner({ onClose, onScanned }: QrScannerProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanningImage, setIsScanningImage] = useState(false);
  const didScan = useRef(false);
  const frameLeft = (width - FRAME_SIZE) / 2;
  const frameTop = (height - FRAME_SIZE) / 2;

  const completeScan = useCallback(
    (scannedValue: string) => {
      if (didScan.current) return;

      didScan.current = true;
      onScanned(scannedValue);
    },
    [onScanned],
  );

  const handleBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      completeScan(data);
    },
    [completeScan],
  );

  const handleImagePick = useCallback(async () => {
    if (isScanningImage || didScan.current) return;

    setIsScanningImage(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled) return;

      const [scan] = await scanFromURLAsync(result.assets[0].uri, ["qr"]);

      if (!scan) {
        Alert.alert(
          "QR kod nije pronađen",
          "Izaberite fotografiju na kojoj je QR kod jasno vidljiv.",
        );
        return;
      }

      completeScan(scan.data);
    } catch {
      Alert.alert(
        "Skeniranje nije uspelo",
        "Pokušajte ponovo sa drugom fotografijom.",
      );
    } finally {
      setIsScanningImage(false);
    }
  }, [completeScan, isScanningImage]);

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-center text-xl text-white">
          Omogućite pristup kameri da biste skenirali QR kod.
        </Text>
        <Pressable
          className="mt-6 rounded-2xl bg-ccyan px-6 py-4"
          onPress={requestPermission}>
          <Text className="text-lg font-inria-bold text-white">
            Omogući kameru
          </Text>
        </Pressable>
        <Pressable className="mt-5 px-6 py-3" onPress={onClose}>
          <Text className="text-lg text-white">Nazad</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {!isScanningImage && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}
      <StatusBar barStyle="light-content" />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            height: frameTop,
            backgroundColor: DIM_COLOR,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: frameTop + FRAME_SIZE,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: DIM_COLOR,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: frameTop,
            left: 0,
            width: frameLeft,
            height: FRAME_SIZE,
            backgroundColor: DIM_COLOR,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: frameTop,
            right: 0,
            width: frameLeft,
            height: FRAME_SIZE,
            backgroundColor: DIM_COLOR,
          }}
        />
        <View
          className="absolute border-2 border-white"
          style={{
            top: frameTop,
            left: frameLeft,
            width: FRAME_SIZE,
            height: FRAME_SIZE,
          }}
        />
        <Text
          className="absolute px-5 text-center text-lg text-white"
          style={{ top: frameTop + FRAME_SIZE + 20, width }}>
          Postavite QR kod unutar okvira
        </Text>
      </View>

      <View
        className="flex-1 justify-between px-5"
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Zatvori QR skener"
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            onPress={onClose}>
            <Ionicons name="close" size={28} color="#004B7C" />
          </Pressable>
          <Text className="text-xl font-inria-bold text-white">Skeniraj QR kod</Text>
          <View className="h-12 w-12" />
        </View>

        <Pressable
          accessibilityLabel="Izaberi QR kod iz galerije"
          className="flex-row items-center justify-center gap-3 rounded-2xl bg-white py-4"
          disabled={isScanningImage}
          onPress={handleImagePick}>
          {isScanningImage ? (
            <ActivityIndicator color="#004B7C" />
          ) : (
            <Ionicons name="images-outline" size={24} color="#004B7C" />
          )}
          <Text className="text-lg font-inria-bold text-ctirquise">
            {isScanningImage ? "Skeniranje fotografije..." : "Izaberi iz galerije"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
