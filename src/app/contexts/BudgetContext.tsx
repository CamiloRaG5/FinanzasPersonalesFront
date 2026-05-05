import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";

import {
  createBudgetRequest,
  getBudgetsByUserRequest,
  updateBudgetRequest,
  deleteBudgetRequest,
  createBudgetAllocationRequest,
  updateBudgetAllocationRequest,
  type BudgetPayload,
} from "../services/budgetService";

export type BudgetAllocation = {
  categoryId: string;
  category: string;
  amount: number;
};

export interface Budget {
  id: string;
  userId: string;
  month: string;
  income: number;
  expenseLimit: number;
  allocations: BudgetAllocation[];
}

type CreateBudgetInput = {
  userId: string;
  month: string;
  income: number;
  expenseLimit: number;
};

interface BudgetContextType {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  createBudget: (
    budget: CreateBudgetInput
  ) => Promise<{ success: boolean; message?: string }>;
  getBudgetForMonth: (userId: string, month: string) => Budget | undefined;
  updateBudgetAllocation: (
    budgetId: string,
    categoryId: string,
    categoryName: string,
    amount: number
  ) => Promise<{ success: boolean; message?: string }>;
  updateBudget: (
    budgetId: string,
    income: number,
    expenseLimit: number
  ) => Promise<{ success: boolean; message?: string }>;
  deleteBudget: (
    budgetId: string
  ) => Promise<{ success: boolean; message?: string }>;
  reloadBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudgets = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("useBudgets must be used within BudgetProvider");
  }

  return context;
};

function normalizeMonthForUI(value: string) {
  return String(value ?? "").slice(0, 7);
}

function normalizeMonthForBackend(value: string) {
  const cleanValue = String(value ?? "").trim();

  if (cleanValue.length === 7) {
    return `${cleanValue}-01`;
  }

  return cleanValue;
}

function mapApiBudget(budget: any): Budget {
  const user =
    typeof budget?.user === "object" && budget.user !== null
      ? budget.user
      : null;

  const rawAllocations =
    budget?.allocations ??
    budget?.budgetAllocations ??
    budget?.categories ??
    [];

  return {
    id: String(budget?.id ?? budget?.budgetId ?? budget?._id ?? ""),
    userId: String(budget?.userId ?? user?.id ?? user?.userId ?? ""),
    month: normalizeMonthForUI(
      budget?.month ??
        budget?.budgetMonth ??
        budget?.period ??
        budget?.date ??
        ""
    ),
    income: Number(
      budget?.income ??
        budget?.totalIncome ??
        budget?.monthlyIncome ??
        budget?.expectedIncome ??
        0
    ),
    expenseLimit: Number(
      budget?.expenseLimit ??
        budget?.limit ??
        budget?.monthlyExpenseLimit ??
        budget?.totalBudget ??
        0
    ),
    allocations: Array.isArray(rawAllocations)
      ? rawAllocations.map((allocation: any) => {
          const category =
            typeof allocation?.category === "object" &&
            allocation.category !== null
              ? allocation.category
              : null;

          const categoryName =
            allocation?.categoryName ??
            category?.name ??
            allocation?.name ??
            (typeof allocation?.category === "string"
              ? allocation.category
              : null) ??
            "Sin categoría";

          return {
            categoryId: String(
              allocation?.categoryId ??
                category?.id ??
                category?.categoryId ??
                allocation?.id ??
                ""
            ),
            category: String(categoryName),
            amount: Number(
              allocation?.amount ??
                allocation?.value ??
                allocation?.limit ??
                allocation?.budgetAmount ??
                allocation?.newAmount ??
                0
            ),
          };
        })
      : [],
  };
}

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadBudgets = useCallback(async () => {
    if (!user?.id) {
      setBudgets([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getBudgetsByUserRequest(user.id);

      setBudgets(data.map(mapApiBudget));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cargar los presupuestos";

      setError(message);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    reloadBudgets();
  }, [reloadBudgets]);

  const createBudget = async (budget: CreateBudgetInput) => {
    if (!budget.userId) {
      return {
        success: false,
        message: "No hay usuario autenticado",
      };
    }

    if (!budget.month) {
      return {
        success: false,
        message: "El mes es obligatorio",
      };
    }

    if (!budget.income || Number(budget.income) <= 0) {
      return {
        success: false,
        message: "Los ingresos deben ser mayores a cero",
      };
    }

    if (!budget.expenseLimit || Number(budget.expenseLimit) <= 0) {
      return {
        success: false,
        message: "El límite de gastos debe ser mayor a cero",
      };
    }

    const existingBudget = budgets.find(
      (item) =>
        item.userId === budget.userId &&
        normalizeMonthForUI(item.month) === normalizeMonthForUI(budget.month)
    );

    if (existingBudget) {
      return {
        success: false,
        message: "Ya existe un presupuesto para este mes",
      };
    }

    const payload: BudgetPayload = {
      userId: budget.userId,
      month: normalizeMonthForBackend(budget.month),
      totalIncome: Number(budget.income),
      expenseLimit: Number(budget.expenseLimit),
    };

    try {
      setLoading(true);
      setError(null);

      const createdBudget = await createBudgetRequest(payload);

      const mappedBudget = mapApiBudget({
        ...createdBudget,
        userId: budget.userId,
        month: budget.month,
        income: budget.income,
        totalIncome: budget.income,
        expenseLimit: budget.expenseLimit,
      });

      setBudgets((prev) => [mappedBudget, ...prev]);

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al crear el presupuesto";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const getBudgetForMonth = (userId: string, month: string) => {
    return budgets.find(
      (budget) =>
        budget.userId === userId &&
        normalizeMonthForUI(budget.month) === normalizeMonthForUI(month)
    );
  };

  const updateBudgetAllocation = async (
    budgetId: string,
    categoryId: string,
    categoryName: string,
    amount: number
  ) => {
    const budget = budgets.find((item) => item.id === budgetId);

    if (!budget) {
      return {
        success: false,
        message: "No se encontró el presupuesto",
      };
    }

    if (!budget.userId) {
      return {
        success: false,
        message: "No se encontró el usuario del presupuesto",
      };
    }

    if (!categoryId) {
      return {
        success: false,
        message: "No se encontró la categoría",
      };
    }

    const cleanAmount = Number(amount);

    if (Number.isNaN(cleanAmount) || cleanAmount < 0) {
      return {
        success: false,
        message: "El monto debe ser un número válido",
      };
    }

    const existingAllocation = budget.allocations.find(
      (allocation) =>
        allocation.categoryId === categoryId ||
        allocation.category === categoryName
    );

    const currentOtherAllocations = budget.allocations
      .filter(
        (allocation) =>
          allocation.categoryId !== categoryId &&
          allocation.category !== categoryName
      )
      .reduce((sum, allocation) => sum + Number(allocation.amount), 0);

    if (currentOtherAllocations + cleanAmount > budget.expenseLimit) {
      return {
        success: false,
        message: "El monto excede el presupuesto disponible",
      };
    }

    try {
      setLoading(true);
      setError(null);

      if (existingAllocation) {
        await updateBudgetAllocationRequest(budgetId, categoryId, {
          userId: budget.userId,
          newAmount: cleanAmount,
        });
      } else {
        await createBudgetAllocationRequest(budgetId, {
          userId: budget.userId,
          categoryId,
          amount: cleanAmount,
        });
      }

      setBudgets((prev) =>
        prev.map((item) => {
          if (item.id !== budgetId) {
            return item;
          }

          const alreadyExists = item.allocations.some(
            (allocation) =>
              allocation.categoryId === categoryId ||
              allocation.category === categoryName
          );

          const updatedAllocations = alreadyExists
            ? item.allocations.map((allocation) =>
                allocation.categoryId === categoryId ||
                allocation.category === categoryName
                  ? {
                      ...allocation,
                      categoryId,
                      category: categoryName,
                      amount: cleanAmount,
                    }
                  : allocation
              )
            : [
                ...item.allocations,
                {
                  categoryId,
                  category: categoryName,
                  amount: cleanAmount,
                },
              ];

          return {
            ...item,
            allocations: updatedAllocations,
          };
        })
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la asignación";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (
    budgetId: string,
    income: number,
    expenseLimit: number
  ) => {
    const budget = budgets.find((item) => item.id === budgetId);

    if (!budget) {
      return {
        success: false,
        message: "No se encontró el presupuesto",
      };
    }

    if (!budget.userId) {
      return {
        success: false,
        message: "No se encontró el usuario del presupuesto",
      };
    }

    if (income <= 0 || expenseLimit <= 0) {
      return {
        success: false,
        message: "Los valores deben ser mayores a cero",
      };
    }

    const totalAllocated = budget.allocations.reduce(
      (sum, allocation) => sum + Number(allocation.amount),
      0
    );

    if (expenseLimit < totalAllocated) {
      return {
        success: false,
        message:
          "El límite de gastos no puede ser menor al total asignado por categorías",
      };
    }

    try {
      setLoading(true);
      setError(null);

      await updateBudgetRequest(
        budgetId,
        budget.userId,
        Number(income),
        Number(expenseLimit)
      );

      setBudgets((prev) =>
        prev.map((item) =>
          item.id === budgetId
            ? {
                ...item,
                income: Number(income),
                expenseLimit: Number(expenseLimit),
              }
            : item
        )
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el presupuesto";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    const budget = budgets.find((item) => item.id === budgetId);

    if (!budget) {
      return {
        success: false,
        message: "No se encontró el presupuesto",
      };
    }

    if (!budget.userId) {
      return {
        success: false,
        message: "No se encontró el usuario del presupuesto",
      };
    }

    try {
      setLoading(true);
      setError(null);

      await deleteBudgetRequest(budgetId, budget.userId);

      setBudgets((prev) => prev.filter((item) => item.id !== budgetId));

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar el presupuesto";

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
    <BudgetContext.Provider
      value={{
        budgets,
        loading,
        error,
        createBudget,
        getBudgetForMonth,
        updateBudgetAllocation,
        updateBudget,
        deleteBudget,
        reloadBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};