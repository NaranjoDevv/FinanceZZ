"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface IncomeExpenseChartProps {
  totalIncome: number;
  totalExpenses: number;
  currency: string;
}

export function IncomeExpenseChart({ 
  totalIncome, 
  totalExpenses, 
  currency 
}: IncomeExpenseChartProps) {
  const user = useQuery(api.users.getCurrentUser);
  const useRounding = user?.numberRounding || false;
  
  const data = [
    {
      name: "Ingresos",
      amount: totalIncome,
      fill: "#10b981"
    },
    {
      name: "Gastos",
      amount: totalExpenses,
      fill: "#ef4444"
    }
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length && payload[0]) {
      return (
        <div className="brutal-card bg-white p-3 border-2 border-black shadow-brutal">
          <p className="font-black text-sm uppercase tracking-wide">
            {label}
          </p>
          <p className="font-bold text-lg">
            {formatCurrencyWithRounding(payload[0].value, toCurrency(currency), useRounding)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="brutal-card p-6">
      <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
        Ingresos vs Gastos
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 'bold' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 'bold' }}
              tickFormatter={(value: number) => formatCurrencyWithRounding(value, toCurrency(currency), useRounding)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              stroke="#000"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}