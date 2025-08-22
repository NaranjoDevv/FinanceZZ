import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export interface BudgetFilters {
  isActive?: boolean;
  period?: "monthly" | "yearly";
}

export function useBudgets(filters?: BudgetFilters) {
  const { user } = useUser();
  
  // Get current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Get user budgets
  const budgets = useQuery(
    api.budgets.getUserBudgets,
    currentUser?._id ? {
      userId: currentUser._id,
      ...filters
    } : "skip"
  );
  
  // Get budget summary for dashboard
  const summary = useQuery(
    api.budgets.getBudgetSummary,
    currentUser?._id ? {
      userId: currentUser._id,
    } : "skip"
  );
  
  const isLoading = !user || currentUser === undefined || 
    (currentUser && budgets === undefined) || 
    (currentUser && summary === undefined);
  
  return {
    budgets: budgets || [],
    summary: summary || {
      totalBudgets: 0,
      totalBudgetAmount: 0,
      totalSpending: 0,
      overBudgetCount: 0,
      nearLimitCount: 0,
      overallProgress: 0,
      budgets: []
    },
    isLoading,
    currentUser,
    isAuthenticated: !!user,
    error: null
  };
}

export function useBudgetDetails(budgetId?: Id<"budgets">) {
  const budgetDetails = useQuery(
    api.budgets.getBudgetDetails,
    budgetId ? { budgetId } : "skip"
  );
  
  return {
    budgetDetails,
    isLoading: budgetDetails === undefined && !!budgetId,
    error: null
  };
}

export function useCreateBudget() {
  const createBudget = useMutation(api.budgets.createBudget);
  
  return {
    createBudget,
    isLoading: false
  };
}

export function useUpdateBudget() {
  const updateBudget = useMutation(api.budgets.updateBudget);
  
  return {
    updateBudget,
    isLoading: false
  };
}

export function useDeleteBudget() {
  const deleteBudget = useMutation(api.budgets.deleteBudget);
  
  return {
    deleteBudget,
    isLoading: false
  };
}

// Hook for budget validation and limits checking
export function useBudgetLimits() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { budgets } = useBudgets();
  
  const canCreateBudget = () => {
    if (!currentUser) return false;
    if (currentUser.plan === "premium") return true;
    
    // Free users can create up to 3 budgets
    const freeBudgetLimit = 3;
    return budgets.length < freeBudgetLimit;
  };
  
  const getBudgetLimitInfo = () => {
    if (!currentUser) return { limit: 0, used: 0, canCreate: false };
    
    if (currentUser.plan === "premium") {
      return { limit: -1, used: budgets.length, canCreate: true }; // -1 indicates unlimited
    }
    
    const freeBudgetLimit = 3;
    return {
      limit: freeBudgetLimit,
      used: budgets.length,
      canCreate: budgets.length < freeBudgetLimit
    };
  };
  
  return {
    canCreateBudget: canCreateBudget(),
    limitInfo: getBudgetLimitInfo(),
    currentUser,
    isLoading: !user || currentUser === undefined
  };
}

// Hook for budget alerts and notifications
export function useBudgetAlerts() {
  const { summary } = useBudgets({ isActive: true });
  
  const getAlerts = () => {
    if (!summary.budgets) return [];
    
    const alerts = [];
    
    summary.budgets.forEach((budget: any) => {
      if (budget.isOverBudget) {
        alerts.push({
          type: "over_budget" as const,
          severity: "high" as const,
          budgetId: budget._id,
          categoryName: budget.category?.name || "General",
          message: `Has excedido el presupuesto de ${budget.category?.name || "General"} por $${(budget.currentSpending - budget.amount).toLocaleString()}`,
          amount: budget.currentSpending - budget.amount,
          progress: budget.progress
        });
      } else if (budget.isNearLimit) {
        alerts.push({
          type: "near_limit" as const,
          severity: "medium" as const,
          budgetId: budget._id,
          categoryName: budget.category?.name || "General",
          message: `Te acercas al límite del presupuesto de ${budget.category?.name || "General"} (${Math.round(budget.progress)}%)`,
          amount: budget.remainingAmount,
          progress: budget.progress
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };
  
  return {
    alerts: getAlerts(),
    hasAlerts: getAlerts().length > 0,
    overBudgetCount: summary.overBudgetCount,
    nearLimitCount: summary.nearLimitCount,
    isLoading: summary === undefined
  };
}

// Hook for budget analytics and insights
export function useBudgetAnalytics(period: "monthly" | "yearly" = "monthly") {
  const { budgets } = useBudgets({ isActive: true, period });
  
  const getAnalytics = () => {
    if (!budgets.length) return null;
    
    const totalBudgeted = budgets.reduce((sum: number, budget: any) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum: number, budget: any) => sum + budget.currentSpending, 0);
    const avgProgress = budgets.reduce((sum: number, budget: any) => sum + budget.progress, 0) / budgets.length;
    
    const categoryBreakdown = budgets.map((budget: any) => ({
      categoryId: budget.categoryId,
      categoryName: budget.category?.name || "General",
      budgeted: budget.amount,
      spent: budget.currentSpending,
      remaining: budget.remainingAmount,
      progress: budget.progress,
      isOverBudget: budget.isOverBudget
    }));
    
    const topSpendingCategories = [...categoryBreakdown]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
    
    const mostOverBudgetCategories = categoryBreakdown
      .filter(cat => cat.isOverBudget)
      .sort((a, b) => (b.spent - b.budgeted) - (a.spent - a.budgeted));
    
    return {
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      avgProgress,
      budgetCount: budgets.length,
      categoryBreakdown,
      topSpendingCategories,
      mostOverBudgetCategories,
      savingsRate: totalBudgeted > 0 ? ((totalBudgeted - totalSpent) / totalBudgeted) * 100 : 0
    };
  };
  
  return {
    analytics: getAnalytics(),
    isLoading: budgets === undefined,
    period
  };
}