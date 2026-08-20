import { useApi } from "@/context/useApi";
import { Currency } from "@/assets/data/homePageData";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  isLoadingTransactions: boolean;
  isLoadingMoreTransactions: boolean;
  transactionPage: number;
  transactionLastPage: number;
  transactionTotal: number;
  errorMessage: string | null;
};

type PaginatedTransactions = {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

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

const CATEGORY_SUFFIXES: Record<
  NonNullable<TransactionHistoryOptions["category"]>,
  string | null
> = {
  groceries: "5411",
  restaurants: "5812",
  fuel: "5541",
  utilities: "4900",
  telecom: "4814",
  transport: "4111",
  pharmacy: "5912",
  clothing: "5691",
  electronics: "5732",
  fitness: "7997",
  other: null,
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
        const response = await api.get<PaginatedTransactions>("/transactions", {
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
        page = response.data;
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 404) throw error;

        const accountsResponse = await api.get<Account[]>("/accounts");
        const accounts = accountsResponse.data;
        const accountIds = new Set(
          accounts.map((account) => account.accountId),
        );
        const responses = await Promise.all(
          accounts.map((account) =>
            api.get<Transaction[]>(
              `/accounts/${encodeURIComponent(account.accountId)}/transactions`,
            ),
          ),
        );
        const transactionsById = new Map<string, Transaction>();
        responses
          .flatMap((response) => response.data)
          .forEach((transaction) =>
            transactionsById.set(transaction.id, transaction),
          );

        const query = search.trim().toLocaleLowerCase();
        const now = Date.now();
        const categorySuffix = category ? CATEGORY_SUFFIXES[category] : null;
        const categorySuffixes = Object.values(CATEGORY_SUFFIXES).filter(
          (suffix): suffix is string => suffix !== null,
        );
        const transactions = Array.from(transactionsById.values())
          .filter((transaction) => {
            const isExpense = accountIds.has(transaction.senderAccount);
            const counterpartyAccount = isExpense
              ? transaction.recipientAccount
              : transaction.senderAccount;
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
              (!category ||
                (category === "other"
                  ? !categorySuffixes.some((suffix) =>
                      counterpartyAccount.endsWith(suffix),
                    )
                  : counterpartyAccount.endsWith(categorySuffix!))) &&
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
      const response = await api.get<PaginatedTransactions>("/transactions", {
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

      const page = response.data;
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
      const allTransactions: Transaction[] = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const response = await api.get<PaginatedTransactions>("/transactions", {
          params: { page: currentPage, per_page: 100 },
        });
        allTransactions.push(...response.data.data);
        lastPage = response.data.last_page;
        currentPage += 1;
      } while (currentPage <= lastPage);

      return allTransactions;
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 404) throw error;

      const accountsResponse = await api.get<Account[]>("/accounts");
      const responses = await Promise.all(
        accountsResponse.data.map((account) =>
          api.get<Transaction[]>(
            `/accounts/${encodeURIComponent(account.accountId)}/transactions`,
          ),
        ),
      );
      const transactions = new Map<string, Transaction>();

      responses
        .flatMap((response) => response.data)
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
