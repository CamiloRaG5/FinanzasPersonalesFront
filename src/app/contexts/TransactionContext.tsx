import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";

import {
  createIncomeRequest,
  createExpenseRequest,
  getTransactionHistoryRequest,
  deleteTransactionRequest,
  updateTransactionCategoryRequest,
  type TransactionType,
} from "../services/transactionService";

import {
  getCategoriesRequest,
  type Category,
} from "../services/categoryService";

export type { TransactionType };

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  category: string;
  date: string;
  userId: string;
}

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate?: string;
  date?: string;
  userId?: string;
  categoryId: string;
};

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  addTransaction: (
    transaction: CreateTransactionInput
  ) => Promise<{ success: boolean; message?: string }>;
  deleteTransaction: (
    id: string,
    userId: string
  ) => Promise<{ success: boolean; message?: string }>;
  updateTransactionCategory: (
    id: string,
    categoryId: string,
    userId: string
  ) => Promise<{ success: boolean; message?: string }>;
  reloadTransactions: () => Promise<void>;
  reloadCategories: () => Promise<void>;
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

function detectTransactionType(transaction: any): TransactionType {
  const rawType =
    transaction.type ??
    transaction.transactionType ??
    transaction.movementType ??
    transaction.operationType ??
    transaction.kind ??
    transaction.nature ??
    transaction.direction ??
    "";

  const typeText =
    typeof rawType === "object" && rawType !== null
      ? String(
          rawType.name ??
            rawType.type ??
            rawType.value ??
            rawType.code ??
            ""
        ).toLowerCase()
      : String(rawType).toLowerCase();

  if (
    typeText.includes("expense") ||
    typeText.includes("expenses") ||
    typeText.includes("gasto") ||
    typeText.includes("gastos") ||
    typeText.includes("egreso") ||
    typeText.includes("egresos") ||
    typeText.includes("outcome") ||
    typeText.includes("outflow") ||
    typeText.includes("debit") ||
    typeText.includes("withdraw") ||
    typeText.includes("payment")
  ) {
    return "expense";
  }

  return "income";
}

function mapApiTransaction(transaction: any): Transaction {
  const category =
    typeof transaction.category === "object" && transaction.category !== null
      ? transaction.category
      : null;

  const user =
    typeof transaction.user === "object" && transaction.user !== null
      ? transaction.user
      : null;

  return {
    id: String(transaction.id ?? transaction.transactionId ?? transaction._id),
    type: detectTransactionType(transaction),
    amount: Number(transaction.amount ?? transaction.value ?? 0),
    description: String(transaction.description ?? ""),
    categoryId: String(
      transaction.categoryId ??
        category?.id ??
        category?.categoryId ??
        ""
    ),
    category: String(
      transaction.categoryName ??
        category?.name ??
        category?.categoryName ??
        "Sin categoría"
    ),
    date: String(
      transaction.transactionDate ??
        transaction.date ??
        transaction.createdAt ??
        ""
    ),
    userId: String(transaction.userId ?? user?.id ?? user?.userId ?? ""),
  };
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadCategories = useCallback(async () => {
    try {
      setError(null);

      const data = await getCategoriesRequest();

      setCategories(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar las categorías";

      setError(message);
      setCategories([]);
    }
  }, []);

  const reloadTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getTransactionHistoryRequest(user.id);

      const mappedTransactions = data.map(mapApiTransaction);

      setTransactions(mappedTransactions);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar las transacciones";

      setError(message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    reloadCategories();
  }, [reloadCategories]);

  useEffect(() => {
    reloadTransactions();
  }, [reloadTransactions]);

  const addTransaction = async (transaction: CreateTransactionInput) => {
    const userId = transaction.userId || user?.id;

    if (!userId) {
      return {
        success: false,
        message: "No hay usuario autenticado",
      };
    }

    if (!transaction.categoryId) {
      return {
        success: false,
        message: "Debes seleccionar una categoría",
      };
    }

    if (!transaction.amount || Number(transaction.amount) <= 0) {
      return {
        success: false,
        message: "El monto debe ser mayor a cero",
      };
    }

    const payload = {
      amount: Number(transaction.amount),
      description: transaction.description || "",
      transactionDate:
        transaction.transactionDate ||
        transaction.date ||
        new Date().toISOString().split("T")[0],
      userId,
      categoryId: transaction.categoryId,
    };

    try {
      setLoading(true);
      setError(null);

      const createdTransaction =
        transaction.type === "income"
          ? await createIncomeRequest(payload)
          : await createExpenseRequest(payload);

      const mappedTransaction = mapApiTransaction({
        ...createdTransaction,
        type: transaction.type,
        userId,
        categoryId: transaction.categoryId,
        transactionDate: payload.transactionDate,
      });

      setTransactions((prev) => [mappedTransaction, ...prev]);

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al crear la transacción";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string, userId: string) => {
    if (!id) {
      return {
        success: false,
        message: "No se encontró la transacción",
      };
    }

    if (!userId) {
      return {
        success: false,
        message: "No se encontró el usuario",
      };
    }

    try {
      setLoading(true);
      setError(null);

      await deleteTransactionRequest(id, userId);

      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id)
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar la transacción";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionCategory = async (
    id: string,
    categoryId: string,
    _userId: string
  ) => {
    if (!id) {
      return {
        success: false,
        message: "No se encontró la transacción",
      };
    }

    if (!categoryId) {
      return {
        success: false,
        message: "Debes seleccionar una categoría",
      };
    }

    try {
      setLoading(true);
      setError(null);

      await updateTransactionCategoryRequest(id, categoryId);

      const selectedCategory = categories.find(
        (category) => String(category.id) === String(categoryId)
      );

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                categoryId,
                category: selectedCategory?.name || transaction.category,
              }
            : transaction
        )
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la categoría";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        loading,
        error,
        addTransaction,
        deleteTransaction,
        updateTransactionCategory,
        reloadTransactions,
        reloadCategories,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};