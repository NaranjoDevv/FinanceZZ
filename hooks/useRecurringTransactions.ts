import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export type RecurringTransactionType = "income" | "expense" | "debt_payment" | "loan_received";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  _id: Id<"recurringTransactions">;
  type: RecurringTransactionType;
  amount: number;
  description: string;
  categoryId?: Id<"categories">;
  subcategoryId?: Id<"subcategories">;
  categoryName?: string | undefined;
  subcategoryName?: string | undefined;
  recurringFrequency: RecurringFrequency;
  nextExecutionDate?: number;
  isActive: boolean;
  totalExecutions: number;
  createdAt: number;
  updatedAt: number;
  userId: Id<"users">;
  tags?: string;
  notes?: string;
  _creationTime: number;
}

export interface RecurringTransactionStats {
  total: number;
  active: number;
  paused: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
}

export interface CreateRecurringTransactionArgs {
  type: RecurringTransactionType;
  amount: number;
  description: string;
  categoryId?: Id<"categories">;
  subcategoryId?: Id<"subcategories">;
  recurringFrequency: RecurringFrequency;
  nextExecutionDate: number;
  tags?: string;
  notes?: string;
}

export interface UpdateRecurringTransactionArgs {
  id: Id<"recurringTransactions">;
  type?: RecurringTransactionType;
  amount?: number;
  description?: string;
  categoryId?: Id<"categories">;
  subcategoryId?: Id<"subcategories">;
  recurringFrequency?: RecurringFrequency;
  nextExecutionDate?: number;
}

export const useRecurringTransactions = () => {
  const recurringTransactions = useQuery(api.recurringTransactions.getRecurringTransactions);
  const stats = useQuery(api.recurringTransactions.getRecurringTransactionStats);
  
  const createMutation = useMutation(api.recurringTransactions.createRecurringTransaction);
  const updateMutation = useMutation(api.recurringTransactions.updateRecurringTransaction);
  const toggleMutation = useMutation(api.recurringTransactions.toggleRecurringTransaction);
  const deleteMutation = useMutation(api.recurringTransactions.deleteRecurringTransaction);

  const createRecurringTransaction = async (args: CreateRecurringTransactionArgs) => {
    try {
      await createMutation(args);
      toast.success("Transacción recurrente creada exitosamente");
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
      toast.error("Error al crear la transacción recurrente");
      throw error;
    }
  };

  const updateRecurringTransaction = async (args: UpdateRecurringTransactionArgs) => {
    try {
      await updateMutation(args);
      toast.success("Transacción recurrente actualizada exitosamente");
    } catch (error) {
      console.error("Error updating recurring transaction:", error);
      toast.error("Error al actualizar la transacción recurrente");
      throw error;
    }
  };

  const toggleRecurringTransaction = async (id: Id<"recurringTransactions">, isActive: boolean) => {
    try {
      await toggleMutation({ id, isActive });
      toast.success(
        isActive 
          ? "Transacción recurrente activada" 
          : "Transacción recurrente pausada"
      );
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      toast.error("Error al cambiar el estado de la transacción");
      throw error;
    }
  };

  const deleteRecurringTransaction = async (id: Id<"recurringTransactions">) => {
    try {
      await deleteMutation({ id });
      toast.success("Transacción recurrente eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Error al eliminar la transacción recurrente");
      throw error;
    }
  };

  // Helper function to calculate next execution date
  const calculateNextExecutionDate = (frequency: RecurringFrequency, fromDate?: Date): number => {
    const baseDate = fromDate || new Date();
    const nextDate = new Date(baseDate);

    switch (frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate.getTime();
  };

  // Helper function to format frequency
  const formatFrequency = (frequency: RecurringFrequency): string => {
    const frequencies = {
      daily: "Diario",
      weekly: "Semanal",
      monthly: "Mensual",
      yearly: "Anual"
    };
    return frequencies[frequency];
  };

  // Helper function to get frequency options
  const getFrequencyOptions = () => [
    { value: "daily" as RecurringFrequency, label: "Diario" },
    { value: "weekly" as RecurringFrequency, label: "Semanal" },
    { value: "monthly" as RecurringFrequency, label: "Mensual" },
    { value: "yearly" as RecurringFrequency, label: "Anual" }
  ];

  // Helper function to calculate monthly impact
  const calculateMonthlyImpact = (amount: number, frequency: RecurringFrequency): number => {
    switch (frequency) {
      case "daily":
        return amount * 30;
      case "weekly":
        return amount * 4.33;
      case "monthly":
        return amount;
      case "yearly":
        return amount / 12;
      default:
        return amount;
    }
  };

  return {
    // Data
    recurringTransactions: recurringTransactions || [],
    stats: stats || {
      total: 0,
      active: 0,
      paused: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyNet: 0
    },
    
    // Loading states
    isLoading: recurringTransactions === undefined || stats === undefined,
    
    // Actions
    createRecurringTransaction,
    updateRecurringTransaction,
    toggleRecurringTransaction,
    deleteRecurringTransaction,
    
    // Helpers
    calculateNextExecutionDate,
    formatFrequency,
    getFrequencyOptions,
    calculateMonthlyImpact
  };
};