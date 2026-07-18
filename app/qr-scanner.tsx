import QrScanner from "@/components/qr-scanner";
import { submitQrScan } from "@/lib/qr-scanner-navigation";
import { useRouter } from "expo-router";

export default function QrScannerPage() {
  const router = useRouter();

  const closeScanner = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home");
  };

  return (
    <QrScanner
      onClose={closeScanner}
      onScanned={(scannedValue) => {
        submitQrScan(scannedValue);
        closeScanner();
      }}
    />
  );
}
