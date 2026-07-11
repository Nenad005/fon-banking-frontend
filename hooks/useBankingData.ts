import { useApi } from "@/context/useApi";
import { Currency } from "@/assets/data/homePageData";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Account = {
  title: string;
  name: string;
  accountId: string;
  balance: number;
  color: "magenta" | "tirquise" | string;
  currency: Currency;
};

export type Card = {
  accountId: string;
  cardId: string;
  cardType: "Master" | "Visa";
  expireDate: string;
  ownerName: string;
  currency: Currency;
  cvv: string;
};

export type Transaction = {
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

type BankingDataState = {
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  isLoading: boolean;
  errorMessage: string | null;
};

const initialState: BankingDataState = {
  accounts: [],
  cards: [],
  transactions: [],
  isLoading: false,
  errorMessage: null,
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Podaci nisu mogli da se ucitaju.";
};

export const useBankingData = () => {
  const api = useApi();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<BankingDataState>(initialState);

  const loadBankingData = useCallback(async () => {
    if (!isAuthenticated) {
      setState(initialState);
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: true,
      errorMessage: null,
    }));

    try {
      const accountsResponse = await api.get<Account[]>("/accounts");
      const accounts = accountsResponse.data;

      const [cardResponses, transactionResponses] = await Promise.all([
        Promise.all(
          accounts.map((account) =>
            api.get<Card[]>(
              `/accounts/${encodeURIComponent(account.accountId)}/cards`,
            ),
          ),
        ),
        Promise.all(
          accounts.map((account) =>
            api.get<Transaction[]>(
              `/accounts/${encodeURIComponent(account.accountId)}/transactions`,
            ),
          ),
        ),
      ]);

      const cards = cardResponses.flatMap((response) => response.data);
      const transactionsById = new Map<string, Transaction>();

      transactionResponses
        .flatMap((response) => response.data)
        .forEach((transaction) => {
          transactionsById.set(transaction.id, transaction);
        });

      const transactions = Array.from(transactionsById.values()).sort(
        (first, second) =>
          new Date(second.transactionTime).getTime() -
          new Date(first.transactionTime).getTime(),
      );

      setState({
        accounts,
        cards,
        transactions,
        isLoading: false,
        errorMessage: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }, [api, isAuthenticated]);

  useEffect(() => {
    void loadBankingData();
  }, [loadBankingData]);

  const accountIds = useMemo(
    () => new Set(state.accounts.map((account) => account.accountId)),
    [state.accounts],
  );

  return {
    ...state,
    accountIds,
    refetch: loadBankingData,
  };
};
