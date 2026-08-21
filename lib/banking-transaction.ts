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
  model: number | null;
  referenceNumber: string | null;
  amount: number;
  currency: Currency;
  senderAmount: number | null;
  senderCurrency: Currency | null;
  recipientAmount: number | null;
  recipientCurrency: Currency | null;
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
  readonly model: number | null;
  readonly referenceNumber: string | null;
  readonly amount: number;
  readonly currency: Currency;
  readonly senderAmount: number | null;
  readonly senderCurrency: Currency | null;
  readonly recipientAmount: number | null;
  readonly recipientCurrency: Currency | null;
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
    this.model = data.model;
    this.referenceNumber = data.referenceNumber;
    this.amount = data.amount;
    this.currency = data.currency;
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

  involvesAccount(accountId: string) {
    return (
      this.senderAccount === accountId || this.recipientAccount === accountId
    );
  }

  getDisplayAmount(ownAccountIds: Set<string>) {
    return this.isOutgoing(ownAccountIds)
      ? (this.senderAmount ?? this.amount)
      : (this.recipientAmount ?? this.amount);
  }

  getDisplayCurrency(ownAccountIds: Set<string>) {
    return this.isOutgoing(ownAccountIds)
      ? (this.senderCurrency ?? this.currency)
      : (this.recipientCurrency ?? this.currency);
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
