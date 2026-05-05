import React, { createContext, useContext, useState } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string, userId: string) => boolean;
  updateTransactionCategory: (id: string, newCategory: string, userId: string) => boolean;
  categories: string[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

const defaultCategories = ['Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Otros'];

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const transactionIdCounter = React.useRef(1);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: String(transactionIdCounter.current++),
    };

    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string, userId: string) => {
    const transaction = transactions.find(t => t.id === id);

    if (!transaction) {
      return false;
    }

    if (transaction.userId !== userId) {
      return false;
    }

    setTransactions(transactions.filter(t => t.id !== id));
    return true;
  };

  const updateTransactionCategory = (id: string, newCategory: string, userId: string) => {
    const transaction = transactions.find(t => t.id === id);

    if (!transaction) {
      return false;
    }

    if (transaction.userId !== userId) {
      return false;
    }

    if (!defaultCategories.includes(newCategory)) {
      return false;
    }

    setTransactions(transactions.map(t =>
      t.id === id ? { ...t, category: newCategory } : t
    ));
    return true;
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      updateTransactionCategory,
      categories: defaultCategories
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
