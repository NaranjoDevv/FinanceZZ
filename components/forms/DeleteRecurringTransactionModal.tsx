"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
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

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[95vh] sm:max-h-[85vh] overflow-y-auto sm:overflow-visible"
          >
            <Card className="brutal-card">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b-4 border-black bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-red-600 text-white border-4 border-black">
                    <TrashIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-red-600 uppercase tracking-wide">
                      ELIMINAR TRANSACCIÓN RECURRENTE
                    </h2>
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="sm"
                  className="border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Warning Header */}
                <div className="flex items-center gap-3 p-4 border-4 border-red-600 bg-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-black uppercase text-red-600 text-lg">
                      ¡ACCIÓN IRREVERSIBLE!
                    </h3>
                    <p className="text-sm text-red-700 font-bold">
                      Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-black uppercase text-black mb-4 text-lg">DETALLES DE LA TRANSACCIÓN</h4>
                  
                  <div className="space-y-3">
                    {/* Description and Type */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-black text-xl text-black">{transaction.description}</h5>
                        <span className={`text-sm font-black uppercase ${getTypeColor(transaction.type)}`}>
                          {TYPE_LABELS[transaction.type]}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-2xl text-black">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-gray-800 font-black uppercase">
                          {FREQUENCY_LABELS[transaction.recurringFrequency]}
                        </div>
                      </div>
                    </div>

                    {/* Status and Next Execution Row */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t-4 border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-black uppercase">Estado:</span>
                        <span className={`px-2 py-1 text-sm font-black uppercase border-4 ${
                          transaction.isActive
                            ? "border-green-600 bg-green-100 text-green-600"
                            : "border-gray-600 bg-gray-100 text-gray-600"
                        }`}>
                          {transaction.isActive ? "ACTIVA" : "PAUSADA"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-black text-black uppercase">
                          {transaction.nextExecutionDate ? new Date(transaction.nextExecutionDate).toLocaleDateString() : 'No programada'}
                        </span>
                      </div>
                    </div>

                    {/* Execution Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-sm font-black text-black uppercase">Ejecutada:</span>
                        <div className="font-black text-black text-lg">{transaction.totalExecutions} veces</div>
                      </div>
                      <div>
                        <span className="text-sm font-black text-black uppercase">Última vez:</span>
                        <div className="font-black text-black text-lg">
                          {transaction.lastExecutionDate 
                            ? new Date(transaction.lastExecutionDate).toLocaleDateString()
                            : "Nunca"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Impact */}
                <div className="p-4 border-4 border-orange-600 bg-white shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
                  <h4 className="font-black uppercase text-orange-600 mb-4 flex items-center gap-2 text-lg">
                    <CurrencyDollarIcon className="h-6 w-6" />
                    IMPACTO FINANCIERO
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-sm font-black text-black uppercase">Mensual</div>
                      <div className="font-black text-xl text-orange-600">
                        {formatCurrency(Math.abs(impact.monthly))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-black text-black uppercase">Anual</div>
                      <div className="font-black text-xl text-orange-600">
                        {formatCurrency(Math.abs(impact.yearly))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-orange-700 font-black mt-4 text-center uppercase">
                    {transaction.type === "income" ? "Dejarás de recibir" : "Dejarás de gastar"} estos montos automáticamente.
                  </p>
                </div>

                {/* Confirmation Message */}
                <div className="p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-center font-black text-black text-lg uppercase">
                    ¿Estás seguro de que deseas eliminar 
                    <span className="text-red-600">&quot;{transaction.description}&quot;</span>?
                  </p>
                </div>

              </div>

              {/* Footer */}
              <div className="flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide"
                  disabled={isDeleting}
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white border-4 border-black font-black hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_#666] uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={isDeleting}
                >
                  <TrashIcon className="h-5 w-5" />
                  {isDeleting ? "ELIMINANDO..." : "ELIMINAR"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}