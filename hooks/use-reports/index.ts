import { useTransactions } from "@/hooks/use-transactions";
import { useMemo } from "react";

export interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  subcategoryDistribution: {
    name: string;
    value: number;
    color: string;
    category: string;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f59e0b', // amber
];

export function useReports(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const transactionsHook = useTransactions(filters);
  const { transactions, stats, isLoading, currentUser } = transactionsHook;

  const reportData: ReportData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0,
        categoryDistribution: [],
        subcategoryDistribution: [],
        monthlyTrend: []
      };
    }

    // Calculate basic stats
    const incomeTransactions = transactions.filter(t => 
      t.type === 'income' || t.type === 'loan_received'
    );
    const expenseTransactions = transactions.filter(t => 
      t.type === 'expense' || t.type === 'debt_payment'
    );

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Calculate category distribution for expenses
    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Sin categoría';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + transaction.amount);
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] || '#6B7280'
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate subcategory distribution for expenses
    const subcategoryMap = new Map<string, { value: number; category: string }>();
    expenseTransactions.forEach(transaction => {
      if (transaction.subcategory) {
        const subcategoryName = transaction.subcategory.name;
        const categoryName = transaction.category?.name || 'Sin categoría';
        const current = subcategoryMap.get(subcategoryName) || { value: 0, category: categoryName };
        subcategoryMap.set(subcategoryName, {
          value: current.value + transaction.amount,
          category: categoryName
        });
      }
    });

    const subcategoryDistribution = Array.from(subcategoryMap.entries())
      .map(([name, data], index) => ({
        name,
        value: data.value,
        category: data.category,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] || '#6B7280'
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate monthly trend (last 6 months)
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      monthlyMap.set(monthKey, { income: 0, expenses: 0 });
    }

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = transactionDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      
      if (monthlyMap.has(monthKey)) {
        const current = monthlyMap.get(monthKey)!;
        if (transaction.type === 'income' || transaction.type === 'loan_received') {
          current.income += transaction.amount;
        } else {
          current.expenses += transaction.amount;
        }
      }
    });

    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      categoryDistribution,
      subcategoryDistribution,
      monthlyTrend
    };
  }, [transactions]);

  // Create a refetch function that forces re-query
  const refetch = () => {
    // Since Convex queries are reactive, the data will automatically update
    // when the underlying data changes. No need for manual reload.
    console.log('Data will refresh automatically due to Convex reactivity');
  };

  return {
    reportData,
    isLoading,
    currentUser,
    hasData: transactions && transactions.length > 0,
    refetch
  };
}