"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface TransactionTypeSelectorProps {
  value: "income" | "expense";
  onChange: (type: "income" | "expense") => void;
}

export function TransactionTypeSelector({ value, onChange }: TransactionTypeSelectorProps) {
  const buttonClass = (type: "income" | "expense") => `
    brutal-button h-12 font-black uppercase tracking-wide transition-all duration-200
    ${value === type
      ? type === "income"
        ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
        : "bg-red-500 hover:bg-red-600 text-white border-red-500"
      : "border-black hover:bg-black hover:text-white"
    }
  `;

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2 sm:gap-3">
        <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
        Tipo de Transacción
      </label>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          type="button"
          variant={value === "income" ? "default" : "outline"}
          className={buttonClass("income") + " h-10 sm:h-12 text-xs sm:text-base"}
          onClick={() => onChange("income")}
        >
          <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Ingreso
        </Button>
        <Button
          type="button"
          variant={value === "expense" ? "default" : "outline"}
          className={buttonClass("expense") + " h-10 sm:h-12 text-xs sm:text-base"}
          onClick={() => onChange("expense")}
        >
          <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Gasto
        </Button>
      </div>
    </div>
  );
}