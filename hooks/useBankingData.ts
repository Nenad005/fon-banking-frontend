import { useApi } from "@/context/useApi";
import { Currency } from "@/lib/currency";
import {
  BankingTransaction,
  BankingTransactionData,
} from "@/lib/banking-transaction";
import { useAuth } from "@/context/AuthContext";
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
  accountId?: string;
  cardId?: string;
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
    accountId,
    cardId,
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

  const loadTransactions = useCallback(
    async (preserveTransactions = false) => {
      if (!isAuthenticated) return;

      const requestId = ++transactionRequestId.current;
      paginationRef.current = { page: 1, lastPage: 1, isLoading: true };
      setState((current) => ({
        ...current,
        transactions: preserveTransactions ? current.transactions : [],
        isLoadingTransactions: true,
        isLoadingMoreTransactions: false,
        transactionPage: 1,
        transactionLastPage: 1,
        transactionTotal: preserveTransactions ? current.transactionTotal : 0,
        errorMessage: null,
      }));

      try {
        const response = await api.get<PaginatedTransactionData>(
          "/transactions",
          {
            params: {
              page: 1,
              per_page: perPage,
              search: search.trim() || undefined,
              direction,
              period,
              method,
              account_id: accountId,
              card_id: cardId,
            },
          },
        );
        const page = hydrateTransactionPage(response.data);

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
    },
    [
      accountId,
      api,
      cardId,
      direction,
      isAuthenticated,
      method,
      perPage,
      period,
      search,
    ],
  );

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
      const response = await api.get<PaginatedTransactionData>(
        "/transactions",
        {
          params: {
            page: nextPage,
            per_page: perPage,
            search: search.trim() || undefined,
            direction,
            period,
            method,
            account_id: accountId,
            card_id: cardId,
          },
        },
      );

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
  }, [
    accountId,
    api,
    cardId,
    direction,
    isAuthenticated,
    method,
    perPage,
    period,
    search,
  ]);

  const getAllTransactions = useCallback(async () => {
    const allTransactions: BankingTransaction[] = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const response = await api.get<PaginatedTransactionData>(
        "/transactions",
        {
          params: {
            page: currentPage,
            per_page: 100,
            search: search.trim() || undefined,
            direction,
            period,
            method,
            account_id: accountId,
            card_id: cardId,
          },
        },
      );
      allTransactions.push(...response.data.data.map(hydrateTransaction));
      lastPage = response.data.last_page;
      currentPage += 1;
    } while (currentPage <= lastPage);

    return allTransactions;
  }, [accountId, api, cardId, direction, method, period, search]);

  const refetch = useCallback(async () => {
    await Promise.all([loadAccountsAndCards(), loadTransactions(true)]);
  }, [loadAccountsAndCards, loadTransactions]);

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
    refetch,
  };
};
