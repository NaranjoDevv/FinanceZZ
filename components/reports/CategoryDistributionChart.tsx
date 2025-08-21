"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyWithRounding, toCurrency } from "@/lib/currency";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CategoryData {
  name: string;
  value: number;
  color?: string;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  currency: string;
  title: string;
}

const COLORS = [
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

export function CategoryDistributionChart({ 
  data, 
  currency, 
  title 
}: CategoryDistributionChartProps) {
  const user = useQuery(api.users.getCurrentUser);
  const useRounding = user?.numberRounding || false;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; total: number } }> }) => {
    if (active && payload && payload.length && payload[0]) {
      const data = payload[0].payload;
      const value = isNaN(data.value) || !isFinite(data.value) ? 0 : data.value;
      const total = isNaN(data.total) || !isFinite(data.total) ? 0 : data.total;
      const percentage = total > 0 ? ((value / total) * 100) : 0;
      
      return (
        <div className="brutal-card bg-white p-3 border-2 border-black shadow-brutal">
          <p className="font-black text-sm uppercase tracking-wide">
            {data.name || 'Sin nombre'}
          </p>
          <p className="font-bold text-lg">
            {formatCurrencyWithRounding(value, toCurrency(currency), useRounding)}
          </p>
          <p className="text-xs font-medium text-gray-600">
            {isNaN(percentage) || !isFinite(percentage) ? '0.0' : percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: Array<{ color: string; value: string }> }) => {
    return (
      <div className="flex flex-wrap justify-center gap-3">
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

  // Add total to each data point for percentage calculation with NaN validation
  const total = data.reduce((sum, item) => {
    const value = isNaN(item.value) || !isFinite(item.value) ? 0 : item.value;
    return sum + value;
  }, 0);
  
  const dataWithTotal = data.map(item => ({
    ...item,
    value: isNaN(item.value) || !isFinite(item.value) ? 0 : item.value,
    total
  })).filter(item => item.value > 0); // Filter out zero values

  if (data.length === 0) {
    return (
      <Card className="brutal-card p-6">
        <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
          {title}
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">
            No hay datos para mostrar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="brutal-card p-6">
      <h3 className="text-xl font-black uppercase tracking-wide mb-6 text-black">
        {title}
      </h3>
      <div className="h-80 flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                 data={dataWithTotal}
                 cx="50%"
                 cy="45%"
                 innerRadius={50}
                 outerRadius={90}
                 paddingAngle={0}
                 dataKey="value"
                 stroke="#000"
                 strokeWidth={1}
               >
                {dataWithTotal.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <CustomLegend payload={dataWithTotal.map((item, index) => ({
            color: (item.color ?? COLORS[index % COLORS.length]) as string,
            value: item.name
          }))} />
        </div>
      </div>
    </Card>
  );
}