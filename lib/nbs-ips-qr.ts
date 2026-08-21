import { formatAccountNumber } from "@/lib/account-number";

export type NbsQrFields = {
  K?: string;
  V?: string;
  C?: string;
  R?: string;
  N?: string;
  I?: string;
  P?: string;
  SF?: string;
  S?: string;
  RO?: string;
};

export type NbsQrResponse = {
  s?: { code?: number; desc?: string };
  t?: string;
  n?: NbsQrFields;
  i?: string;
  e?: string[];
};

export type PaymentQrData = {
  recipientName: string;
  recipientAccount: string;
  model: string;
  referenceNumber: string;
  amount: string;
  paymentCode: string;
  purpose: string;
};

const cleanSingleLine = (value = "") =>
  value.replace(/\r?\n/g, ", ").replace(/\s+/g, " ").trim();

export function isSuccessfulNbsResponse(response: NbsQrResponse) {
  return response.s?.code === 0 && Boolean(response.n);
}

export function nbsErrorMessage(response: NbsQrResponse) {
  return response.e?.filter(Boolean).join("\n") || response.s?.desc || "QR kod nije ispravan.";
}

export function mapNbsFieldsToPayment(fields: NbsQrFields): PaymentQrData {
  const amountMatch = fields.I?.match(/^RSD(\d+(?:,\d{1,2})?)$/);
  const reference = fields.RO?.trim() ?? "";

  return {
    recipientName: cleanSingleLine(fields.N),
    recipientAccount: formatAccountNumber(fields.R ?? ""),
    model: reference.slice(0, 2),
    referenceNumber: reference.slice(2),
    amount: amountMatch?.[1] ?? "",
    paymentCode: fields.SF?.trim() ?? "",
    purpose: cleanSingleLine(fields.S),
  };
}

export function buildNbsQrText(data: PaymentQrData) {
  const account = data.recipientAccount.replace(/\D/g, "");
  const parsedAmount = Number(data.amount.trim().replace(",", "."));
  const amount = Number.isFinite(parsedAmount)
    ? parsedAmount.toFixed(2).replace(".", ",")
    : data.amount.trim().replace(".", ",");
  const tags = [
    "K:PR",
    "V:01",
    "C:1",
    `R:${account}`,
    `N:${data.recipientName.trim()}`,
    `I:RSD${amount}`,
    data.paymentCode.trim() && `SF:${data.paymentCode.trim()}`,
    data.purpose.trim() && `S:${data.purpose.trim()}`,
    (data.model.trim() || data.referenceNumber.trim()) &&
      `RO:${data.model.trim()}${data.referenceNumber.trim()}`,
  ].filter(Boolean);

  return tags.join("|");
}
