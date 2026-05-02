import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BudgetAllocation {
  category: string;
  amount: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  income: number;
  expenseLimit: number;
  allocations: BudgetAllocation[];
}

interface BudgetContextType {
  budgets: Budget[];
  createBudget: (budget: Omit<Budget, 'id' | 'allocations'>) => void;
  updateBudgetAllocation: (budgetId: string, category: string, amount: number) => boolean;
  updateBudget: (budgetId: string, income: number, expenseLimit: number) => boolean;
  deleteBudget: (budgetId: string) => boolean;
  getBudgetForMonth: (userId: string, month: string) => Budget | undefined;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within BudgetProvider');
  }
  return context;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const storedBudgets = localStorage.getItem('budgets');
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  }, []);

  const createBudget = (budget: Omit<Budget, 'id' | 'allocations'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      allocations: [],
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
  };

  const updateBudgetAllocation = (budgetId: string, category: string, amount: number) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) {
      return false;
    }

    const totalAllocated = budget.allocations
      .filter(a => a.category !== category)
      .reduce((sum, a) => sum + a.amount, 0);

    if (totalAllocated + amount > budget.expenseLimit) {
      return false;
    }

    const updatedBudgets = budgets.map(b => {
      if (b.id === budgetId) {
        const existingAllocation = b.allocations.find(a => a.category === category);
        if (existingAllocation) {
          return {
            ...b,
            allocations: b.allocations.map(a =>
              a.category === category ? { ...a, amount } : a
            ),
          };
        } else {
          return {
            ...b,
            allocations: [...b.allocations, { category, amount }],
          };
        }
      }
      return b;
    });

    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    return true;
  };

  const updateBudget = (budgetId: string, income: number, expenseLimit: number) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) {
      return false;
    }

    if (income <= 0 || expenseLimit <= 0) {
      return false;
    }

    const updatedBudgets = budgets.map(b =>
      b.id === budgetId ? { ...b, income, expenseLimit } : b
    );

    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    return true;
  };

  const deleteBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) {
      return false;
    }

    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    return true;
  };

  const getBudgetForMonth = (userId: string, month: string) => {
    return budgets.find(b => b.userId === userId && b.month === month);
  };

  return (
    <BudgetContext.Provider value={{
      budgets,
      createBudget,
      updateBudgetAllocation,
      updateBudget,
      deleteBudget,
      getBudgetForMonth,
    }}>
      {children}
    </BudgetContext.Provider>
  );
};
