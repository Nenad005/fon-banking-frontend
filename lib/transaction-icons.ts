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
};

const ACCOUNT_SUFFIX_CATEGORY_MAP: Record<
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

const ACCOUNT_SUFFIX_ICON_MAP: Record<string, IoniconName> = {
  "0000": "person-outline",
  "9991": "wallet-outline",
  "9992": "cash-outline",
  "9993": "card-outline",
};

const getAccountSuffix = (accountId: string) => accountId.slice(-4);

export const getCounterpartyAccountId = (
  transaction: TransactionLike,
  ownAccountIds: Set<string>,
) => {
  if (ownAccountIds.has(transaction.senderAccount)) {
    return transaction.recipientAccount;
  }

  return transaction.senderAccount;
};

export const getTransactionIconName = (
  transaction: TransactionLike,
  ownAccountIds: Set<string>,
): IoniconName => {
  const counterpartyAccountId = getCounterpartyAccountId(
    transaction,
    ownAccountIds,
  );
  const suffix = getAccountSuffix(counterpartyAccountId);
  const category = ACCOUNT_SUFFIX_CATEGORY_MAP[suffix];

  return (
    (category
      ? CATEGORY_ICON_MAP[category]
      : ACCOUNT_SUFFIX_ICON_MAP[suffix]) ??
    (transaction.cardNumber ? "card-outline" : "swap-horizontal-outline")
  );
};

export const getTransactionCategory = (
  transaction: TransactionLike,
  ownAccountIds: Set<string>,
): TransactionCategory => {
  const counterpartyAccountId = getCounterpartyAccountId(
    transaction,
    ownAccountIds,
  );

  return (
    ACCOUNT_SUFFIX_CATEGORY_MAP[getAccountSuffix(counterpartyAccountId)] ??
    "other"
  );
};
