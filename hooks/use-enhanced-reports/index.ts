import { useTransactions } from "@/hooks/use-transactions";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useMemo } from "react";

export interface EnhancedReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
  recurringIncome: number;
  recurringExpenses: number;
  recurringBalance: number;
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
    isRecurring?: boolean;
  }[];
  subcategoryDistribution: {
    name: string;
    value: number;
    color: string;
    category: string;
    isRecurring?: boolean;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
    recurringIncome: number;
    recurringExpenses: number;
  }[];
  recurringTransactionsSummary: {
    total: number;
    active: number;
    paused: number;
    monthlyImpact: number;
  };
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

const RECURRING_COLORS = [
  '#dc2626', // darker red
  '#ea580c', // darker orange
  '#ca8a04', // darker yellow
  '#16a34a', // darker green
  '#2563eb', // darker blue
  '#7c3aed', // darker purple
  '#db2777', // darker pink
  '#0891b2', // darker cyan
  '#65a30d', // darker lime
  '#d97706', // darker amber
];

export function useEnhancedReports(filters?: {
  startDate?: number;
  endDate?: number;
}) {
  const transactionsHook = useTransactions(filters);
  const { transactions, stats, isLoading: transactionsLoading, currentUser } = transactionsHook;
  
  const recurringHook = useRecurringTransactions();
  const { recurringTransactions, stats: recurringStats, isLoading: recurringLoading } = recurringHook;

  const isLoading = transactionsLoading || recurringLoading;

  const reportData: EnhancedReportData = useMemo(() => {
    // Initialize empty data structure
    const emptyData: EnhancedReportData = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
      recurringIncome: 0,
      recurringExpenses: 0,
      recurringBalance: 0,
      categoryDistribution: [],
      subcategoryDistribution: [],
      monthlyTrend: [],
      recurringTransactionsSummary: {
        total: 0,
        active: 0,
        paused: 0,
        monthlyImpact: 0
      }
    };

    if ((!transactions || transactions.length === 0) && (!recurringTransactions || recurringTransactions.length === 0)) {
      return emptyData;
    }

    // Process regular transactions
    const incomeTransactions = transactions?.filter(t => 
      t.type === 'income' || t.type === 'loan_received'
    ) || [];
    const expenseTransactions = transactions?.filter(t => 
      t.type === 'expense' || t.type === 'debt_payment'
    ) || [];

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    // Process recurring transactions
    const activeRecurringTransactions = recurringTransactions?.filter(t => t.isActive) || [];
    const recurringIncomeTransactions = activeRecurringTransactions.filter(t => 
      t.type === 'income' || t.type === 'loan_received'
    );
    const recurringExpenseTransactions = activeRecurringTransactions.filter(t => 
      t.type === 'expense' || t.type === 'debt_payment'
    );

    // Calculate monthly impact for recurring transactions
    const calculateMonthlyAmount = (amount: number, frequency: string) => {
      switch (frequency) {
        case 'daily': return amount * 30; // Approximate monthly
        case 'weekly': return amount * 4.33; // Approximate monthly
        case 'monthly': return amount;
        case 'yearly': return amount / 12;
        default: return amount;
      }
    };

    const recurringIncome = recurringIncomeTransactions.reduce((sum, t) => 
      sum + calculateMonthlyAmount(t.amount, t.recurringFrequency), 0
    );
    const recurringExpenses = recurringExpenseTransactions.reduce((sum, t) => 
      sum + calculateMonthlyAmount(t.amount, t.recurringFrequency), 0
    );
    const recurringBalance = recurringIncome - recurringExpenses;

    // Calculate category distribution (combining regular and recurring)
    const categoryMap = new Map<string, { value: number, isRecurring: boolean }>();
    
    // Add regular transactions
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Sin categoría';
      const current = categoryMap.get(categoryName) || { value: 0, isRecurring: false };
      categoryMap.set(categoryName, {
        value: current.value + transaction.amount,
        isRecurring: false
      });
    });

    // Add recurring transactions (monthly equivalent)
    recurringExpenseTransactions.forEach(transaction => {
      const categoryName = transaction.categoryName || 'Sin categoría';
      const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.recurringFrequency);
      const current = categoryMap.get(categoryName + ' (Recurrente)') || { value: 0, isRecurring: true };
      categoryMap.set(categoryName + ' (Recurrente)', {
        value: current.value + monthlyAmount,
        isRecurring: true
      });
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        value: data.value,
        color: data.isRecurring 
          ? RECURRING_COLORS[index % RECURRING_COLORS.length] || '#6B7280'
          : CATEGORY_COLORS[index % CATEGORY_COLORS.length] || '#6B7280',
        isRecurring: data.isRecurring
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate subcategory distribution
    const subcategoryMap = new Map<string, { value: number, category: string, isRecurring: boolean }>();
    
    // Add regular transactions
    expenseTransactions.forEach(transaction => {
      if (transaction.subcategory) {
        const subcategoryName = transaction.subcategory.name;
        const categoryName = transaction.category?.name || 'Sin categoría';
        const current = subcategoryMap.get(subcategoryName) || { value: 0, category: categoryName, isRecurring: false };
        subcategoryMap.set(subcategoryName, {
          value: current.value + transaction.amount,
          category: categoryName,
          isRecurring: false
        });
      }
    });

    // Add recurring transactions
    recurringExpenseTransactions.forEach(transaction => {
      if (transaction.subcategoryName) {
        const subcategoryName = transaction.subcategoryName + ' (Recurrente)';
        const categoryName = transaction.categoryName || 'Sin categoría';
        const monthlyAmount = calculateMonthlyAmount(transaction.amount, transaction.recurringFrequency);
        const current = subcategoryMap.get(subcategoryName) || { value: 0, category: categoryName, isRecurring: true };
        subcategoryMap.set(subcategoryName, {
          value: current.value + monthlyAmount,
          category: categoryName,
          isRecurring: true
        });
      }
    });

    const subcategoryDistribution = Array.from(subcategoryMap.entries())
      .map(([name, data], index) => ({
        name,
        value: data.value,
        category: data.category,
        color: data.isRecurring 
          ? RECURRING_COLORS[index % RECURRING_COLORS.length] || '#6B7280'
          : CATEGORY_COLORS[index % CATEGORY_COLORS.length] || '#6B7280',
        isRecurring: data.isRecurring
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate monthly trend (last 6 months)
    const monthlyMap = new Map<string, { 
      income: number, 
      expenses: number, 
      recurringIncome: number, 
      recurringExpenses: number 
    }>();
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      monthlyMap.set(monthKey, { 
        income: 0, 
        expenses: 0, 
        recurringIncome: 0, 
        recurringExpenses: 0 
      });
    }

    // Add regular transactions to monthly trend
    transactions?.forEach(transaction => {
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

    // Add recurring transactions to all months (as they are recurring)
    Array.from(monthlyMap.keys()).forEach(monthKey => {
      const current = monthlyMap.get(monthKey)!;
      
      recurringIncomeTransactions.forEach(transaction => {
        current.recurringIncome += calculateMonthlyAmount(transaction.amount, transaction.recurringFrequency);
      });
      
      recurringExpenseTransactions.forEach(transaction => {
        current.recurringExpenses += calculateMonthlyAmount(transaction.amount, transaction.recurringFrequency);
      });
    });

    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: (data.income + data.recurringIncome) - (data.expenses + data.recurringExpenses),
      recurringIncome: data.recurringIncome,
      recurringExpenses: data.recurringExpenses
    }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      recurringIncome,
      recurringExpenses,
      recurringBalance,
      categoryDistribution,
      subcategoryDistribution,
      monthlyTrend,
      recurringTransactionsSummary: {
        total: recurringTransactions?.length || 0,
        active: activeRecurringTransactions.length,
        paused: (recurringTransactions?.length || 0) - activeRecurringTransactions.length,
        monthlyImpact: recurringBalance
      }
    };
  }, [transactions, recurringTransactions]);

  // Create a refetch function that forces re-query
  const refetch = () => {
    console.log('Data will refresh automatically due to Convex reactivity');
  };

  return {
    reportData,
    isLoading,
    currentUser,
    hasData: (transactions && transactions.length > 0) || (recurringTransactions && recurringTransactions.length > 0),
    hasTransactions: transactions && transactions.length > 0,
    hasRecurringTransactions: recurringTransactions && recurringTransactions.length > 0,
    refetch
  };
}