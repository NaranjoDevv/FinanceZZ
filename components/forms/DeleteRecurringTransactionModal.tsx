"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/ui/BaseModal";
import { toast } from "sonner";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/lib/currency";
import { Id } from "@/convex/_generated/dataModel";

interface RecurringTransaction {
  _id: Id<"recurringTransactions">;
  type: "income" | "expense" | "debt_payment" | "loan_received";
  amount: number;
  description: string;
  recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
  isActive: boolean;
  nextExecutionDate?: number;
  totalExecutions: number;
  lastExecutionDate?: number;
}

interface DeleteRecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: RecurringTransaction;
}

const TYPE_LABELS = {
  income: "Ingreso",
  expense: "Gasto",
  debt_payment: "Pago de Deuda",
  loan_received: "Préstamo Recibido",
};

const FREQUENCY_LABELS = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

export default function DeleteRecurringTransactionModal({
  isOpen,
  onClose,
  transaction,
}: DeleteRecurringTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteRecurringTransaction = useMutation(api.recurringTransactions.deleteRecurringTransaction);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await deleteRecurringTransaction({ id: transaction._id });
      toast.success("Transacción recurrente eliminada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Error al eliminar la transacción recurrente");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      case "debt_payment":
        return "text-orange-600";
      case "loan_received":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getImpactMessage = () => {
    const frequency = transaction.recurringFrequency;
    const amount = transaction.amount;
    
    let multiplier = 1;
    switch (frequency) {
      case "daily":
        multiplier = 30; // Aproximadamente 30 días al mes
        break;
      case "weekly":
        multiplier = 4.33; // Aproximadamente 4.33 semanas al mes
        break;
      case "monthly":
        multiplier = 1;
        break;
      case "yearly":
        multiplier = 1/12; // 1/12 del año por mes
        break;
    }
    
    const monthlyImpact = amount * multiplier;
    const yearlyImpact = amount * (frequency === "yearly" ? 1 : multiplier * 12);
    
    return {
      monthly: monthlyImpact,
      yearly: yearlyImpact,
    };
  };

  const impact = getImpactMessage();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="ELIMINAR TRANSACCIÓN RECURRENTE">
      <div className="space-y-6">
        {/* Warning Header */}
        <div className="flex items-center gap-3 p-4 border-4 border-red-600 bg-red-50">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-black uppercase text-red-600">
              ¡ACCIÓN IRREVERSIBLE!
            </h3>
            <p className="text-sm text-red-700 font-medium">
              Esta acción no se puede deshacer. La transacción recurrente será eliminada permanentemente.
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-4 border-4 border-black bg-gray-50">
          <h4 className="font-black uppercase text-black mb-4">DETALLES DE LA TRANSACCIÓN</h4>
          
          <div className="space-y-3">
            {/* Description and Type */}
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-black text-lg text-black">{transaction.description}</h5>
                <span className={`text-sm font-bold uppercase ${getTypeColor(transaction.type)}`}>
                  {TYPE_LABELS[transaction.type]}
                </span>
              </div>
              <div className="text-right">
                <div className="font-black text-xl text-black">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {FREQUENCY_LABELS[transaction.recurringFrequency]}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Estado:</span>
              <span className={`px-2 py-1 text-xs font-black uppercase border-2 ${
                transaction.isActive
                  ? "border-green-600 bg-green-100 text-green-600"
                  : "border-gray-600 bg-gray-100 text-gray-600"
              }`}>
                {transaction.isActive ? "ACTIVA" : "PAUSADA"}
              </span>
            </div>

            {/* Next Execution */}
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Próxima ejecución:</span>
              <span className="font-bold text-black">
                {transaction.nextExecutionDate ? new Date(transaction.nextExecutionDate).toLocaleDateString() : 'No programada'}
              </span>
            </div>

            {/* Execution Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t-2 border-gray-300">
              <div>
                <span className="text-sm font-medium text-gray-600">Total ejecutada:</span>
                <div className="font-black text-black">{transaction.totalExecutions} veces</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Última ejecución:</span>
                <div className="font-black text-black">
                  {transaction.lastExecutionDate 
                    ? new Date(transaction.lastExecutionDate).toLocaleDateString()
                    : "Nunca"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="p-4 border-4 border-orange-600 bg-orange-50">
          <h4 className="font-black uppercase text-orange-600 mb-3 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            IMPACTO FINANCIERO
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Impacto Mensual</div>
              <div className="font-black text-lg text-orange-600">
                {formatCurrency(Math.abs(impact.monthly))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Impacto Anual</div>
              <div className="font-black text-lg text-orange-600">
                {formatCurrency(Math.abs(impact.yearly))}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-orange-700 font-medium mt-2 text-center">
            Al eliminar esta transacción, {transaction.type === "income" ? "dejarás de recibir" : "dejarás de gastar"} estos montos automáticamente.
          </p>
        </div>

        {/* Confirmation Message */}
        <div className="p-4 border-4 border-black bg-white">
          <p className="text-center font-medium text-black">
            ¿Estás seguro de que deseas eliminar la transacción recurrente 
            <span className="font-black">&quot;{transaction.description}&quot;</span>?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-4 border-black font-black uppercase tracking-wide hover:bg-gray-100"
          >
            CANCELAR
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white border-4 border-red-600 hover:bg-white hover:text-red-600 transition-all duration-200 font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? "ELIMINANDO..." : "ELIMINAR"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}