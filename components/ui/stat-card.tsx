"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BalanceTooltip } from "@/components/ui/balance-tooltip";

interface StatCardProps {
  title: string;
  value: string;
  fullValue: string;
  rawAmount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  change: string;
  userCurrency: unknown;
  useRounding: boolean;
  index: number;
}

const StatCard = memo(function StatCard({
  title,
  value,
  fullValue,
  rawAmount,
  icon: IconComponent,
  color,
  change,
  userCurrency,
  useRounding,
  index
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
    >
      <Card className="brutal-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <span className={`text-sm font-bold ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1">
          {title}
        </h3>
        <BalanceTooltip
          value={value}
          fullValue={fullValue}
          amount={rawAmount}
          currency={userCurrency}
          useRounding={useRounding}
        >
          <p className="text-2xl font-black cursor-help">
            {value}
          </p>
        </BalanceTooltip>
      </Card>
    </motion.div>
  );
});

export { StatCard };