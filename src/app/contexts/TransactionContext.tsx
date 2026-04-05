import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  createExpenseRequest,
  createIncomeRequest,
  getTransactionHistoryRequest,
} from "../services/transactionService";
import { getCategoriesRequest } from "../services/categoryService";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  categoryName?: string;
  description: string;
  transactionDate: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addIncome: (
    amount: number,
    categoryId: string,
    description: string,
    transactionDate: string
  ) => Promise<{ success: boolean; message?: string }>;
  addExpense: (
    amount: number,
    categoryId: string,
    description: string,
    transactionDate: string
  ) => Promise<{ success: boolean; message?: string }>;
  loadTransactions: () => Promise<void>;
  loadCategories: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionProvider");
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    try {
      const data = await getCategoriesRequest();

      const mapped: Category[] = (Array.isArray(data) ? data : []).map(
        (item: any) => ({
          id: item.id,
          name: item.name,
        })
      );

      setCategories(mapped);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      const data = await getTransactionHistoryRequest(user.id);

      const mapped: Transaction[] = (Array.isArray(data) ? data : []).map(
        (item: any) => ({
        id: item.id,
        type: item.categoryType === "INCOME" ? "income" : "expense",
        amount: Number(item.amount),
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        description: item.description,
        transactionDate: item.transactionDate,
        userId: user.id,
        })
      );

      setTransactions(mapped);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const addIncome = async (
    amount: number,
    categoryId: string,
    description: string,
    transactionDate: string
  ) => {
    if (!user?.id) {
      return { success: false, message: "No hay usuario autenticado" };
    }

    try {
      const data = await createIncomeRequest({
        amount,
        description,
        transactionDate,
        userId: user.id,
        categoryId,
      });

      const newTransaction: Transaction = {
        id: data.id,
        type: "income",
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description,
        transactionDate: data.transactionDate,
        userId: data.userId,
      };

      setTransactions((prev) => [...prev, newTransaction]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo registrar el ingreso",
      };
    }
  };

  const addExpense = async (
    amount: number,
    categoryId: string,
    description: string,
    transactionDate: string
  ) => {
    if (!user?.id) {
      return { success: false, message: "No hay usuario autenticado" };
    }

    try {
      const data = await createExpenseRequest({
        amount,
        description,
        transactionDate,
        userId: user.id,
        categoryId,
      });

      const newTransaction: Transaction = {
        id: data.id,
        type: "expense",
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description,
        transactionDate: data.transactionDate,
        userId: data.userId,
      };

      setTransactions((prev) => [...prev, newTransaction]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo registrar el gasto",
      };
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        addIncome,
        addExpense,
        loadTransactions,
        loadCategories,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};