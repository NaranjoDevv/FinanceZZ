"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { BalanceTooltip } from "@/components/ui/balance-tooltip";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FinancialSummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  type: "income" | "expense" | "balance";
  count?: number;
}

export function FinancialSummaryCard({ 
  title, 
  amount, 
  currency, 
  type, 
  count 
}: FinancialSummaryCardProps) {
  const user = useQuery(api.users.getCurrentUser);
  const useRounding = user?.numberRounding || false;
  
  const getColorClasses = () => {
    switch (type) {
      case "income":
        return "border-green-500 bg-green-50";
      case "expense":
        return "border-red-500 bg-red-50";
      case "balance":
        return amount >= 0 
          ? "border-blue-500 bg-blue-50" 
          : "border-red-500 bg-red-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getAmountColor = () => {
    switch (type) {
      case "income":
        return "text-green-700";
      case "expense":
        return "text-red-700";
      case "balance":
        return amount >= 0 ? "text-blue-700" : "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <Card className={`brutal-card p-6 border-4 ${getColorClasses()}`}>
      <div className="space-y-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-gray-600">
          {title}
        </h3>
        <div className="space-y-1">
          <BalanceTooltip
            value={formatCurrencyWithRounding(amount, toCurrency(currency), useRounding)}
            fullValue={formatCurrency(amount, toCurrency(currency))}
            amount={amount}
            currency={toCurrency(currency)}
            useRounding={useRounding}
          >
            <p className={`text-2xl font-black cursor-help ${getAmountColor()}`}>
              {type === "balance" && amount >= 0 ? "+" : ""}
              {formatCurrencyWithRounding(amount, toCurrency(currency), useRounding)}
            </p>
          </BalanceTooltip>
          {count !== undefined && (
            <p className="text-xs font-medium text-gray-500">
              {count} transacciones
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}