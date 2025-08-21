"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
  currency: string;
}

export function MonthlyTrendChart({ data, currency }: MonthlyTrendChartProps) {
  const user = useQuery(api.users.getCurrentUser);
  const useRounding = user?.numberRounding || false;
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="brutal-card bg-white p-4 border-2 border-black shadow-brutal">
          <p className="font-black text-sm uppercase tracking-wide mb-2">
            {label}
          </p>
          {payload?.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 border border-black" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-bold uppercase tracking-wide">
                {entry.name}:
              </span>
              <span className="font-bold">
                {formatCurrencyWithRounding(entry.value, toCurrency(currency), useRounding)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload?.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 border border-black" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-bold uppercase tracking-wide">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="brutal-card p-6">
        <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
          Tendencia Mensual
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">
            No hay datos suficientes para mostrar la tendencia
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="brutal-card p-6">
      <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
        Tendencia Mensual
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="month" 
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
            <Legend content={<CustomLegend />} />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#000', r: 4 }}
              name="Ingresos"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, stroke: '#000', r: 4 }}
              name="Gastos"
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#000', r: 4 }}
              name="Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}