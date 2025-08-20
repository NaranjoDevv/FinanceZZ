import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export interface TransactionFilters {
  categoryId?: Id<"categories">;
  subcategoryId?: Id<"subcategories">;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useUser();
  
  // Get current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Get user transactions
  const transactions = useQuery(
    api.transactions.getUserTransactions,
    currentUser?._id ? {
      userId: currentUser._id,
      ...filters
    } : "skip"
  );
  
  // Get transaction statistics
  const stats = useQuery(
    api.transactions.getTransactionStats,
    currentUser?._id ? (() => {
      const queryArgs: {
        userId: Id<"users">;
        startDate?: number;
        endDate?: number;
      } = {
        userId: currentUser._id,
      };
      
      if (filters?.startDate) queryArgs.startDate = filters.startDate;
      if (filters?.endDate) queryArgs.endDate = filters.endDate;
      
      return queryArgs;
    })() : "skip"
  );
  
  const isLoading = !user || currentUser === undefined || 
    (currentUser && transactions === undefined) || 
    (currentUser && stats === undefined);
  
  return {
    transactions: transactions || [],
    stats: stats || {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: 0
    },
    isLoading,
    currentUser,
    isAuthenticated: !!user,
    error: null // We can add error handling later if needed
  };
}

export function useCreateTransaction() {
  const createTransaction = useMutation(api.transactions.createTransaction);
  
  return {
    createTransaction,
    isLoading: false // You can add loading state management here
  };
}

export function useUpdateTransaction() {
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  
  return {
    updateTransaction,
    isLoading: false
  };
}

export function useDeleteTransaction() {
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  
  return {
    deleteTransaction,
    isLoading: false
  };
}