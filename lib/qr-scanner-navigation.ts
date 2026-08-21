import type { ImperativeRouter } from "expo-router";
import type { PaymentQrData } from "@/lib/nbs-ips-qr";

type ScanHandler = (payment: PaymentQrData) => void;

let scanHandler: ScanHandler | null = null;

export function openQrScanner(router: ImperativeRouter, onScanned: ScanHandler) {
  scanHandler = onScanned;
  router.push("/qr-scanner");
}

export function submitQrScan(payment: PaymentQrData) {
  const handler = scanHandler;
  scanHandler = null;
  handler?.(payment);
}
