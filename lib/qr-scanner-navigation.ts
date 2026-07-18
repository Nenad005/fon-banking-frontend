import type { ImperativeRouter } from "expo-router";

type ScanHandler = (scannedValue: string) => void;

let scanHandler: ScanHandler | null = null;

export function openQrScanner(router: ImperativeRouter, onScanned: ScanHandler) {
  scanHandler = onScanned;
  router.push("/qr-scanner");
}

export function submitQrScan(scannedValue: string) {
  const handler = scanHandler;
  scanHandler = null;
  handler?.(scannedValue);
}
