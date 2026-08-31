import { Currency } from "@/lib/currency";
import {
  getTransactionCategory,
  getTransactionIconName,
} from "@/lib/transaction-icons";

export type BankingTransactionData = {
  id: string;
  recipientAccount: string;
  recipientName: string;
  senderAccount: string;
  senderName: string;
  model: number | null;
  referenceNumber: string | null;
  senderAmount: number;
  senderCurrency: Currency;
  recipientAmount: number;
  recipientCurrency: Currency;
  exchangeRate: number | null;
  paymentPurpose: string | null;
  paymentCode: string | null;
  transactionTime: string;
  status: "realizovano" | "izvrsena" | "odbijena" | "na_cekanju";
  cardNumber: string | null;
};

export class BankingTransaction implements BankingTransactionData {
  readonly id: string;
  readonly recipientAccount: string;
  readonly recipientName: string;
  readonly senderAccount: string;
  readonly senderName: string;
  readonly model: number | null;
  readonly referenceNumber: string | null;
  readonly senderAmount: number;
  readonly senderCurrency: Currency;
  readonly recipientAmount: number;
  readonly recipientCurrency: Currency;
  readonly exchangeRate: number | null;
  readonly paymentPurpose: string | null;
  readonly paymentCode: string | null;
  readonly transactionTime: string;
  readonly status: BankingTransactionData["status"];
  readonly cardNumber: string | null;

  constructor(data: BankingTransactionData) {
    this.id = data.id;
    this.recipientAccount = data.recipientAccount;
    this.recipientName = data.recipientName;
    this.senderAccount = data.senderAccount;
    this.senderName = data.senderName;
    this.model = data.model;
    this.referenceNumber = data.referenceNumber;
    this.senderAmount = data.senderAmount;
    this.senderCurrency = data.senderCurrency;
    this.recipientAmount = data.recipientAmount;
    this.recipientCurrency = data.recipientCurrency;
    this.exchangeRate = data.exchangeRate;
    this.paymentPurpose = data.paymentPurpose;
    this.paymentCode = data.paymentCode;
    this.transactionTime = data.transactionTime;
    this.status = data.status;
    this.cardNumber = data.cardNumber;
  }

  isOutgoing(ownAccountIds: Set<string>) {
    return ownAccountIds.has(this.senderAccount);
  }

  getDirection(ownAccountIds: Set<string>) {
    const isSenderOwned = ownAccountIds.has(this.senderAccount);
    const isRecipientOwned = ownAccountIds.has(this.recipientAccount);

    if (isSenderOwned && isRecipientOwned) return "internal" as const;
    return isSenderOwned ? ("outgoing" as const) : ("incoming" as const);
  }

  involvesAccount(accountId: string) {
    return (
      this.senderAccount === accountId || this.recipientAccount === accountId
    );
  }

  getDisplayAmount(ownAccountIds: Set<string>) {
    return this.isOutgoing(ownAccountIds)
      ? this.senderAmount
      : this.recipientAmount;
  }

  getDisplayCurrency(ownAccountIds: Set<string>) {
    return this.isOutgoing(ownAccountIds)
      ? this.senderCurrency
      : this.recipientCurrency;
  }

  getCounterpartyAccount(ownAccountIds: Set<string>) {
    return this.isOutgoing(ownAccountIds)
      ? this.recipientAccount
      : this.senderAccount;
  }

  getIcon(ownAccountIds: Set<string>) {
    return getTransactionIconName(this, ownAccountIds);
  }

  getCategory(ownAccountIds: Set<string>) {
    return getTransactionCategory(this, ownAccountIds);
  }
}
