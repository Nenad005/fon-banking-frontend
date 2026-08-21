import QrScanner from "@/components/qr-scanner";
import { useApi } from "@/context/useApi";
import {
  isSuccessfulNbsResponse,
  mapNbsFieldsToPayment,
  nbsErrorMessage,
  NbsQrResponse,
} from "@/lib/nbs-ips-qr";
import { submitQrScan } from "@/lib/qr-scanner-navigation";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export default function QrScannerPage() {
  const router = useRouter();
  const api = useApi();

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
      onScanned={async (scannedValue) => {
        try {
          const { data } = await api.post<NbsQrResponse>("/qr/validate", {
            text: scannedValue,
          });

          if (!isSuccessfulNbsResponse(data) || data.n?.K !== "PR") {
            Alert.alert(
              "Neispravan NBS IPS QR kod",
              data.n?.K && data.n.K !== "PR"
                ? "Ovaj tip IPS QR koda nije namenjen pripremi platnog naloga."
                : nbsErrorMessage(data),
            );
            return false;
          }

          submitQrScan(mapNbsFieldsToPayment(data.n));
          closeScanner();
          return true;
        } catch (error) {
          const message = isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message ?? error.message
            : "QR kod trenutno nije moguće proveriti.";
          Alert.alert("Provera nije uspela", message);
          return false;
        }
      }}
    />
  );
}
