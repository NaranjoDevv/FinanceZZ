"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { BalanceTooltip } from "@/components/ui/balance-tooltip";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { useMemo } from "react";

interface RecurringTransactionData {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  isActive: boolean;
  nextExecution: string;
  executionCount: number;
  categoryId?: string;
  subcategoryId?: string;
}

interface RecurringTransactionsReportProps {
  currency: string;
}

export function RecurringTransactionsReport({ currency }: RecurringTransactionsReportProps) {
  const user = useQuery(api.users.getCurrentUser);
  const recurringTransactions = useQuery(api.recurringTransactions.getRecurringTransactions) as RecurringTransactionData[] | undefined;
  const useRounding = user?.numberRounding || false;

  const getMonthlyMultiplier = (frequency: string) => {
    switch (frequency) {
      case "daily": return 30;
      case "weekly": return 4.33;
      case "monthly": return 1;
      case "yearly": return 1 / 12;
      default: return 1;
    }
  };

  const stats = useMemo(() => {
    if (!recurringTransactions) {
      return {
        total: 0,
        active: 0,
        paused: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyImpact: 0,
        totalExecutions: 0
      };
    }

    const active = recurringTransactions.filter(t => t.isActive);
    const paused = recurringTransactions.filter(t => !t.isActive);

    const monthlyIncome = active
      .filter(t => t.type === "income")
      .reduce((sum, t) => {
        const amount = isNaN(t.amount) || !isFinite(t.amount) ? 0 : t.amount;
        const multiplier = getMonthlyMultiplier(t.frequency);
        const result = amount * multiplier;
        return sum + (isNaN(result) || !isFinite(result) ? 0 : result);
      }, 0);

    const monthlyExpenses = active
      .filter(t => t.type === "expense")
      .reduce((sum, t) => {
        const amount = isNaN(t.amount) || !isFinite(t.amount) ? 0 : t.amount;
        const multiplier = getMonthlyMultiplier(t.frequency);
        const result = amount * multiplier;
        return sum + (isNaN(result) || !isFinite(result) ? 0 : result);
      }, 0);

    const totalExecutions = recurringTransactions.reduce((sum, t) => {
      const execCount = isNaN(t.executionCount) || !isFinite(t.executionCount) ? 0 : t.executionCount;
      return sum + execCount;
    }, 0);

    const monthlyImpact = monthlyIncome - monthlyExpenses;

    return {
      total: recurringTransactions.length,
      active: active.length,
      paused: paused.length,
      monthlyIncome: isNaN(monthlyIncome) || !isFinite(monthlyIncome) ? 0 : monthlyIncome,
      monthlyExpenses: isNaN(monthlyExpenses) || !isFinite(monthlyExpenses) ? 0 : monthlyExpenses,
      monthlyImpact: isNaN(monthlyImpact) || !isFinite(monthlyImpact) ? 0 : monthlyImpact,
      totalExecutions
    };
  }, [recurringTransactions]);

  const frequencyDistribution = useMemo(() => {
    if (!recurringTransactions || recurringTransactions.length === 0) return [];

    const distribution = recurringTransactions.reduce((acc, t) => {
      const freq = t.frequency;
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([frequency, count]) => {
      const percentage = recurringTransactions.length > 0 ? (count / recurringTransactions.length) * 100 : 0;
      return {
        frequency,
        count,
        percentage: isNaN(percentage) || !isFinite(percentage) ? 0 : percentage
      };
    });
  }, [recurringTransactions]);

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Diaria",
      weekly: "Semanal",
      monthly: "Mensual",
      yearly: "Anual"
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  if (!recurringTransactions) {
    return (
      <Card className="brutal-card p-6">
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Cargando transacciones recurrentes...</p>
        </div>
      </Card>
    );
  }

  if (stats.total === 0) {
    return (
      <Card className="brutal-card p-6">
        <h3 className="text-xl font-black uppercase tracking-wide mb-4 text-black">
          📅 TRANSACCIONES RECURRENTES
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium mb-2">
            No tienes transacciones recurrentes
          </p>
          <p className="text-gray-400 text-sm">
            Crea transacciones recurrentes para automatizar tus finanzas
          </p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="brutal-card p-6">
        <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
          📅 TRANSACCIONES RECURRENTES
        </h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="brutal-card p-4 border-4 border-blue-500 bg-blue-50">
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Total
                </p>
                <p className="text-2xl font-black text-blue-700">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="brutal-card p-4 border-4 border-green-500 bg-green-50">
            <div className="flex items-center space-x-3">
              <PlayIcon className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Activas
                </p>
                <p className="text-2xl font-black text-green-700">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card className="brutal-card p-4 border-4 border-orange-500 bg-orange-50">
            <div className="flex items-center space-x-3">
              <PauseIcon className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Pausadas
                </p>
                <p className="text-2xl font-black text-orange-700">
                  {stats.paused}
                </p>
              </div>
            </div>
          </Card>

          <Card className="brutal-card p-4 border-4 border-purple-500 bg-purple-50">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Ejecuciones
                </p>
                <p className="text-2xl font-black text-purple-700">
                  {stats.totalExecutions}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="brutal-card p-4 border-4 border-green-500 bg-green-50">
            <div className="flex items-center space-x-3">
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Ingresos Mensuales
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.monthlyIncome, toCurrency(currency), useRounding)}
                  fullValue={formatCurrency(stats.monthlyIncome, toCurrency(currency))}
                  amount={stats.monthlyIncome}
                  currency={toCurrency(currency)}
                  useRounding={useRounding}
                >
                  <p className="text-xl font-black text-green-700 cursor-help">
                    +{formatCurrencyWithRounding(stats.monthlyIncome, toCurrency(currency), useRounding)}
                  </p>
                </BalanceTooltip>
              </div>
            </div>
          </Card>

          <Card className="brutal-card p-4 border-4 border-red-500 bg-red-50">
            <div className="flex items-center space-x-3">
              <ArrowTrendingDownIcon className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Gastos Mensuales
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(stats.monthlyExpenses, toCurrency(currency), useRounding)}
                  fullValue={formatCurrency(stats.monthlyExpenses, toCurrency(currency))}
                  amount={stats.monthlyExpenses}
                  currency={toCurrency(currency)}
                  useRounding={useRounding}
                >
                  <p className="text-xl font-black text-red-700 cursor-help">
                    -{formatCurrencyWithRounding(stats.monthlyExpenses, toCurrency(currency), useRounding)}
                  </p>
                </BalanceTooltip>
              </div>
            </div>
          </Card>

          <Card className={`brutal-card p-4 border-4 ${stats.monthlyImpact >= 0
              ? 'border-blue-500 bg-blue-50'
              : 'border-red-500 bg-red-50'
            }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.monthlyImpact >= 0 ? 'bg-blue-600' : 'bg-red-600'
                }`}>
                <span className="text-white font-black text-sm">
                  {stats.monthlyImpact >= 0 ? '+' : '-'}
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-600">
                  Impacto Mensual
                </p>
                <BalanceTooltip
                  value={formatCurrencyWithRounding(Math.abs(stats.monthlyImpact), toCurrency(currency), useRounding)}
                  fullValue={formatCurrency(Math.abs(stats.monthlyImpact), toCurrency(currency))}
                  amount={Math.abs(stats.monthlyImpact)}
                  currency={toCurrency(currency)}
                  useRounding={useRounding}
                >
                  <p className={`text-xl font-black cursor-help ${stats.monthlyImpact >= 0 ? 'text-blue-700' : 'text-red-700'
                    }`}>
                    {stats.monthlyImpact >= 0 ? '+' : '-'}
                    {formatCurrencyWithRounding(Math.abs(stats.monthlyImpact), toCurrency(currency), useRounding)}
                  </p>
                </BalanceTooltip>
              </div>
            </div>
          </Card>
        </div>

        {/* Frequency Distribution */}
        <div>
          <h4 className="text-lg font-black uppercase tracking-wide mb-4 text-black">
            Distribución por Frecuencia
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frequencyDistribution.map(({ frequency, count, percentage }) => (
              <Card key={frequency} className="brutal-card p-4 border-2 border-gray-400 bg-gray-50">
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-600 mb-1">
                    {getFrequencyLabel(frequency)}
                  </p>
                  <p className="text-2xl font-black text-gray-800">
                    {count}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}