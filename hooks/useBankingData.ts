import { useApi } from "@/context/useApi";
import { Currency } from "@/lib/currency";
import {
  BankingTransaction,
  BankingTransactionData,
} from "@/lib/banking-transaction";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Account = {
  title: string;
  name: string;
  accountId: string;
  iban: string | null;
  balance: number;
  color: "magenta" | "tirquise" | string;
  currency: Currency;
  qrEligible: boolean;
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

export { BankingTransaction as Transaction } from "@/lib/banking-transaction";

type BankingDataState = {
  accounts: Account[];
  cards: Card[];
  transactions: BankingTransaction[];
  isLoading: boolean;
  isLoadingTransactions: boolean;
  isLoadingMoreTransactions: boolean;
  transactionPage: number;
  transactionLastPage: number;
  transactionTotal: number;
  errorMessage: string | null;
};

type PaginatedTransactions = {
  data: BankingTransaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type PaginatedTransactionData = Omit<PaginatedTransactions, "data"> & {
  data: BankingTransactionData[];
};

const hydrateTransaction = (transaction: BankingTransactionData) =>
  new BankingTransaction(transaction);

const hydrateTransactionPage = (
  page: PaginatedTransactionData,
): PaginatedTransactions => ({
  ...page,
  data: page.data.map(hydrateTransaction),
});

export type TransactionHistoryOptions = {
  search?: string;
  direction?: "income" | "expense";
  period?: "7days" | "30days";
  method?: "card" | "pending";
  category?:
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
  perPage?: number;
};

const initialState: BankingDataState = {
  accounts: [],
  cards: [],
  transactions: [],
  isLoading: false,
  isLoadingTransactions: false,
  isLoadingMoreTransactions: false,
  transactionPage: 1,
  transactionLastPage: 1,
  transactionTotal: 0,
  errorMessage: null,
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Podaci nisu mogli da se ucitaju.";
};

export const useBankingData = (options: TransactionHistoryOptions = {}) => {
  const api = useApi();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<BankingDataState>(initialState);
  const transactionRequestId = useRef(0);
  const paginationRef = useRef({ page: 1, lastPage: 1, isLoading: false });
  const {
    search = "",
    direction,
    period,
    method,
    category,
    perPage = 20,
  } = options;

  const loadAccountsAndCards = useCallback(async () => {
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
      const cardResponses = await Promise.all(
        accounts.map((account) =>
          api.get<Card[]>(
            `/accounts/${encodeURIComponent(account.accountId)}/cards`,
          ),
        ),
      );

      const cards = cardResponses.flatMap((response) => response.data);

      setState((current) => ({
        ...current,
        accounts,
        cards,
        isLoading: false,
        errorMessage: null,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }, [api, isAuthenticated]);

  const loadTransactions = useCallback(async () => {
    if (!isAuthenticated) return;

    const requestId = ++transactionRequestId.current;
    paginationRef.current = { page: 1, lastPage: 1, isLoading: true };
    setState((current) => ({
      ...current,
      transactions: [],
      isLoadingTransactions: true,
      isLoadingMoreTransactions: false,
      transactionPage: 1,
      transactionLastPage: 1,
      transactionTotal: 0,
      errorMessage: null,
    }));

    try {
      let page: PaginatedTransactions;

      try {
        const response = await api.get<PaginatedTransactionData>("/transactions", {
          params: {
            page: 1,
            per_page: perPage,
            search: search.trim() || undefined,
            direction,
            period,
            method,
            category,
          },
        });
        page = hydrateTransactionPage(response.data);
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;

        const accountsResponse = await api.get<Account[]>("/accounts");
        const accounts = accountsResponse.data;
        const accountIds = new Set(
          accounts.map((account) => account.accountId),
        );
        const responses = await Promise.all(
          accounts.map((account) =>
            api.get<BankingTransactionData[]>(
              `/accounts/${encodeURIComponent(account.accountId)}/transactions`,
            ),
          ),
        );
        const transactionsById = new Map<string, BankingTransaction>();
        responses
          .flatMap((response) => response.data.map(hydrateTransaction))
          .forEach((transaction) =>
            transactionsById.set(transaction.id, transaction),
          );

        const query = search.trim().toLocaleLowerCase();
        const now = Date.now();
        const transactions = Array.from(transactionsById.values())
          .filter((transaction) => {
            const isExpense = transaction.isOutgoing(accountIds);
            const age =
              now - new Date(transaction.transactionTime).getTime();
            const searchableText = [
              transaction.recipientName,
              transaction.senderAccount,
              transaction.recipientAccount,
              transaction.paymentPurpose,
              transaction.paymentCode,
            ]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase();

            return (
              (!direction ||
                (direction === "expense" ? isExpense : !isExpense)) &&
              (!period ||
                age <= (period === "7days" ? 7 : 30) * 86400000) &&
              (!method ||
                (method === "card"
                  ? Boolean(transaction.cardNumber)
                  : transaction.status === "na_cekanju")) &&
              (!category || transaction.getCategory(accountIds) === category) &&
              (!query || searchableText.includes(query))
            );
          })
          .sort(
            (first, second) =>
              new Date(second.transactionTime).getTime() -
                new Date(first.transactionTime).getTime() ||
              second.id.localeCompare(first.id),
          );

        page = {
          data: transactions,
          current_page: 1,
          last_page: 1,
          per_page: transactions.length,
          total: transactions.length,
        };
      }

      if (requestId !== transactionRequestId.current) return;

      paginationRef.current = {
        page: page.current_page,
        lastPage: page.last_page,
        isLoading: false,
      };
      setState((current) => ({
        ...current,
        transactions: page.data,
        isLoadingTransactions: false,
        transactionPage: page.current_page,
        transactionLastPage: page.last_page,
        transactionTotal: page.total,
      }));
    } catch (error) {
      if (requestId !== transactionRequestId.current) return;
      paginationRef.current.isLoading = false;
      setState((current) => ({
        ...current,
        isLoadingTransactions: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }, [api, category, direction, isAuthenticated, method, perPage, period, search]);

  const loadMoreTransactions = useCallback(async () => {
    const pagination = paginationRef.current;
    if (
      !isAuthenticated ||
      pagination.isLoading ||
      pagination.page >= pagination.lastPage
    ) {
      return;
    }

    const requestId = transactionRequestId.current;
    const nextPage = pagination.page + 1;
    paginationRef.current.isLoading = true;
    setState((current) => ({
      ...current,
      isLoadingMoreTransactions: true,
    }));

    try {
      const response = await api.get<PaginatedTransactionData>("/transactions", {
        params: {
          page: nextPage,
          per_page: perPage,
          search: search.trim() || undefined,
          direction,
          period,
          method,
          category,
        },
      });

      if (requestId !== transactionRequestId.current) return;

      const page = hydrateTransactionPage(response.data);
      paginationRef.current = {
        page: page.current_page,
        lastPage: page.last_page,
        isLoading: false,
      };
      setState((current) => {
        const transactions = new Map(
          current.transactions.map((transaction) => [
            transaction.id,
            transaction,
          ]),
        );
        page.data.forEach((transaction) =>
          transactions.set(transaction.id, transaction),
        );

        return {
          ...current,
          transactions: Array.from(transactions.values()),
          isLoadingMoreTransactions: false,
          transactionPage: page.current_page,
          transactionLastPage: page.last_page,
          transactionTotal: page.total,
        };
      });
    } catch (error) {
      if (requestId !== transactionRequestId.current) return;
      paginationRef.current.isLoading = false;
      setState((current) => ({
        ...current,
        isLoadingMoreTransactions: false,
        errorMessage: getErrorMessage(error),
      }));
    }
  }, [api, category, direction, isAuthenticated, method, perPage, period, search]);

  const getAllTransactions = useCallback(async () => {
    try {
      const allTransactions: BankingTransaction[] = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const response = await api.get<PaginatedTransactionData>("/transactions", {
          params: { page: currentPage, per_page: 100 },
        });
        allTransactions.push(...response.data.data.map(hydrateTransaction));
        lastPage = response.data.last_page;
        currentPage += 1;
      } while (currentPage <= lastPage);

      return allTransactions;
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 404) throw error;

      const accountsResponse = await api.get<Account[]>("/accounts");
      const responses = await Promise.all(
        accountsResponse.data.map((account) =>
          api.get<BankingTransactionData[]>(
            `/accounts/${encodeURIComponent(account.accountId)}/transactions`,
          ),
        ),
      );
      const transactions = new Map<string, BankingTransaction>();

      responses
        .flatMap((response) => response.data.map(hydrateTransaction))
        .forEach((transaction) => transactions.set(transaction.id, transaction));

      return Array.from(transactions.values()).sort(
        (first, second) =>
          new Date(second.transactionTime).getTime() -
            new Date(first.transactionTime).getTime() ||
          second.id.localeCompare(first.id),
      );
    }
  }, [api]);

  useEffect(() => {
    void loadAccountsAndCards();
  }, [loadAccountsAndCards]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const accountIds = useMemo(
    () => new Set(state.accounts.map((account) => account.accountId)),
    [state.accounts],
  );

  return {
    ...state,
    isLoading: state.isLoading || state.isLoadingTransactions,
    hasMoreTransactions: state.transactionPage < state.transactionLastPage,
    accountIds,
    loadMoreTransactions,
    getAllTransactions,
    refetch: async () => {
      await Promise.all([loadAccountsAndCards(), loadTransactions()]);
    },
  };
};
