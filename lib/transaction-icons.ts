import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type TransactionLike = {
  senderAccount: string;
  recipientAccount: string;
  cardNumber?: string | null;
};

const ACCOUNT_SUFFIX_ICON_MAP: Record<string, IoniconName> = {
  "0000": "person-outline",
  "5411": "basket-outline",
  "5812": "restaurant-outline",
  "5541": "car-outline",
  "4900": "flash-outline",
  "4814": "phone-portrait-outline",
  "4111": "bus-outline",
  "5912": "medkit-outline",
  "5691": "shirt-outline",
  "5732": "desktop-outline",
  "7997": "barbell-outline",
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

  return (
    ACCOUNT_SUFFIX_ICON_MAP[suffix] ??
    (transaction.cardNumber ? "card-outline" : "swap-horizontal-outline")
  );
};
