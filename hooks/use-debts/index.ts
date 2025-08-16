import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export interface DebtFilters {
  type?: "owes_me" | "i_owe";
  status?: "open" | "paid" | "overdue" | "partially_paid";
  counterpartyName?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export function useDebts(filters?: DebtFilters) {
  const { user } = useUser();
  
  // Get current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Get user debts
  const debts = useQuery(
    api.debts.getUserDebts,
    currentUser?._id ? {
      userId: currentUser._id,
      type: filters?.type,
      status: filters?.status
    } : "skip"
  );
  
  // Get debt statistics
  const stats = useQuery(
    api.debts.getDebtStats,
    currentUser?._id ? {
      userId: currentUser._id
    } : "skip"
  );
  
  // Get overdue debts
  const overdueDebts = useQuery(
    api.debts.getOverdueDebts,
    currentUser?._id ? {
      userId: currentUser._id
    } : "skip"
  );
  
  // Get upcoming due debts
  const upcomingDebts = useQuery(
    api.debts.getUpcomingDueDebts,
    currentUser?._id ? {
      userId: currentUser._id,
      days: 7
    } : "skip"
  );
  
  const isLoading = !user || currentUser === undefined || 
    (currentUser && debts === undefined) || 
    (currentUser && stats === undefined);
  
  // Calculate additional stats
  const enhancedStats = stats ? {
    ...stats,
    activeDebts: debts?.filter(debt => debt.status === 'open' || debt.status === 'partially_paid').length || 0,
    overdueDebts: overdueDebts?.length || 0
  } : {
    totalOwedToMe: 0,
    totalIOwe: 0,
    countOwedToMe: 0,
    countIOwe: 0,
    netBalance: 0,
    activeDebts: 0,
    overdueDebts: 0
  };
  
  return {
    debts: debts || [],
    stats: enhancedStats,
    overdueDebts: overdueDebts || [],
    upcomingDebts: upcomingDebts || [],
    isLoading,
    currentUser,
    isAuthenticated: !!user,
    error: null // We can add error handling later if needed
  };
}

export function useCreateDebt() {
  const createDebt = useMutation(api.debts.createDebt);
  
  return {
    createDebt,
    isLoading: false // You can add loading state management here
  };
}

export function useUpdateDebt() {
  const updateDebt = useMutation(api.debts.updateDebt);
  
  return {
    updateDebt,
    isLoading: false
  };
}

export function useDeleteDebt() {
  const deleteDebt = useMutation(api.debts.deleteDebt);
  
  return {
    deleteDebt,
    isLoading: false
  };
}

export function useMarkDebtAsPaid() {
  const markDebtAsPaid = useMutation(api.debts.markDebtAsPaid);
  
  return {
    markDebtAsPaid,
    isLoading: false
  };
}

export function useMakePartialPayment() {
  const makePartialPayment = useMutation(api.debts.makePartialPayment);
  
  return {
    makePartialPayment,
    isLoading: false
  };
}

export function useDebtsByPerson() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const getDebtsByPerson = (counterpartyName: string) => {
    return useQuery(
      api.debts.getDebtsByPerson,
      currentUser?._id ? {
        userId: currentUser._id,
        counterpartyName
      } : "skip"
    );
  };
  
  return {
    getDebtsByPerson,
    currentUser,
    isAuthenticated: !!user
  };
}

export function useDebtSummaryByPerson() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const summary = useQuery(
    api.debts.getDebtSummaryByPerson,
    currentUser?._id ? {
      userId: currentUser._id
    } : "skip"
  );
  
  return {
    summary: summary || [],
    isLoading: !user || currentUser === undefined || (currentUser && summary === undefined),
    currentUser,
    isAuthenticated: !!user
  };
}