import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export type TransactionCategory =
  | "groceries"
  | "restaurants"
  | "fuel"
  | "utilities"
  | "telecom"
  | "transport"
  | "pharmacy"
  | "clothing"
  | "electronics"
  | "fitness"
  | "other";

export type TransactionCategoryOption = {
  value: TransactionCategory;
  label: string;
  icon: IoniconName;
};

type TransactionLike = {
  senderAccount: string;
  recipientAccount: string;
  cardNumber?: string | null;
  paymentCode?: string | null;
  paymentPurpose?: string | null;
};

const PAYMENT_CODE_CATEGORY_MAP: Record<
  string,
  Exclude<TransactionCategory, "other">
> = {
  "5411": "groceries",
  "5812": "restaurants",
  "5541": "fuel",
  "4900": "utilities",
  "4814": "telecom",
  "4111": "transport",
  "5912": "pharmacy",
  "5691": "clothing",
  "5732": "electronics",
  "7997": "fitness",
};

export const TRANSACTION_CATEGORIES: TransactionCategoryOption[] = [
  { value: "groceries", label: "Namirnice", icon: "basket-outline" },
  { value: "restaurants", label: "Restorani", icon: "restaurant-outline" },
  { value: "fuel", label: "Gorivo", icon: "car-outline" },
  { value: "utilities", label: "Računi", icon: "flash-outline" },
  { value: "telecom", label: "Telekom", icon: "phone-portrait-outline" },
  { value: "transport", label: "Prevoz", icon: "bus-outline" },
  { value: "pharmacy", label: "Apoteka", icon: "medkit-outline" },
  { value: "clothing", label: "Odeća", icon: "shirt-outline" },
  { value: "electronics", label: "Elektronika", icon: "desktop-outline" },
  { value: "fitness", label: "Fitnes", icon: "barbell-outline" },
  { value: "other", label: "Ostalo", icon: "ellipsis-horizontal-outline" },
];

const CATEGORY_ICON_MAP = Object.fromEntries(
  TRANSACTION_CATEGORIES.map(({ value, icon }) => [value, icon]),
) as Record<TransactionCategory, IoniconName>;

const PAYMENT_CODE_ICON_MAP: Record<string, IoniconName> = {
  opening_balance: "wallet-outline",
  income: "cash-outline",
  business_funding: "card-outline",
};

export const getTransactionIconName = (
  transaction: TransactionLike,
  ownAccountIds: Set<string>,
): IoniconName => {
  const category = transaction.paymentCode
    ? PAYMENT_CODE_CATEGORY_MAP[transaction.paymentCode]
    : undefined;

  if (category) return CATEGORY_ICON_MAP[category];

  const paymentCodeIcon = PAYMENT_CODE_ICON_MAP[transaction.paymentCode ?? ""];
  if (paymentCodeIcon) return paymentCodeIcon;
  if (transaction.cardNumber) return "card-outline";

  const purpose = transaction.paymentPurpose?.toLocaleLowerCase("sr-Latn-RS") ?? "";
  if (purpose.includes("pozajmica")) return "cash-outline";
  if (purpose.includes("refund")) return "return-down-back-outline";
  if (purpose.includes("uslug")) return "briefcase-outline";

  return ownAccountIds.has(transaction.senderAccount)
    ? "arrow-up-circle-outline"
    : "arrow-down-circle-outline";
};

export const getTransactionCategory = (
  transaction: TransactionLike,
  _ownAccountIds: Set<string>,
): TransactionCategory => {
  return transaction.paymentCode
    ? PAYMENT_CODE_CATEGORY_MAP[transaction.paymentCode] ?? "other"
    : "other";
};
