"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface BalanceTooltipProps {
  children: ReactNode;
  value?: string;
  fullValue: string;
  amount: number;
  currency: string;
  useRounding: boolean;
}

export function BalanceTooltip({ children, fullValue, useRounding }: BalanceTooltipProps) {
  // Si no está redondeado, no mostrar tooltip
  if (!useRounding) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="cursor-help"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
          >
            {children}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="
            bg-black text-white border-2 border-black 
            shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] 
            font-bold text-sm px-3 py-2 rounded-lg
            max-w-none
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="uppercase tracking-wide">Valor Completo:</span>
            <span className="font-black">{fullValue}</span>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}