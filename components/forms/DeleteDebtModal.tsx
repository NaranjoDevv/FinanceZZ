"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency, toCurrency } from "@/lib/currency";

interface Debt {
  _id: string;
  type: 'owes_me' | 'i_owe';
  originalAmount: number;
  currentAmount: number;
  description: string;
  counterpartyName: string;
  counterpartyContact?: string;
  startDate: number;
  dueDate?: number;
  status: 'open' | 'paid' | 'overdue' | 'partially_paid';
  interestRate?: number;
  notes?: string;
}

interface DeleteDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export default function DeleteDebtModal({
  isOpen,
  onClose,
  debt
}: DeleteDebtModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const deleteDebt = useMutation(api.debts.deleteDebt);
  
  const userCurrency = toCurrency(currentUser?.currency || 'USD');

  const handleDelete = async () => {
    if (!currentUser || !debt) return;

    setIsDeleting(true);

    try {
      await deleteDebt({
        id: debt._id as Id<"debts">,
        userId: currentUser._id,
      });

      onClose();
    } catch (error) {
      console.error("Error deleting debt:", error);
      // You can add toast notification here
    } finally {
      setIsDeleting(false);
    }
  };



  const getDebtTypeText = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'Me Deben' : 'Debo';
  };

  const getDebtTypeColor = (type: 'owes_me' | 'i_owe') => {
    return type === 'owes_me' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'open': 'Abierta',
      'paid': 'Pagada',
      'overdue': 'Vencida',
      'partially_paid': 'Parcialmente Pagada'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="brutal-card p-0 border-4 border-black shadow-brutal max-w-md w-full overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Eliminar Deuda</DialogTitle>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="delete-debt-modal"
              className="bg-white w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-red-50">
                <div className="flex items-center gap-3">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-black uppercase tracking-wider text-red-600">
                    Eliminar Deuda
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="brutal-button p-2 hover:bg-black hover:text-white transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Decorative line */}
              <motion.div
                className="w-full h-1 bg-red-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Content */}
              <div className="p-6 bg-white">
                {/* Warning Icon */}
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
                >
                  <div className="brutal-card border-4 border-red-500 bg-red-50 p-4">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                  </div>
                </motion.div>

                {/* Warning Message */}
                <motion.div
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <h3 className="text-lg font-black uppercase tracking-wider mb-2">
                    ¿Estás seguro?
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Esta acción no se puede deshacer. La deuda será eliminada permanentemente.
                  </p>
                </motion.div>

                {/* Debt Details */}
                {debt && (
                  <motion.div
                    className="brutal-card border-2 border-gray-300 bg-gray-50 p-4 mb-6 space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-gray-600">
                        Tipo
                      </span>
                      <span className={`font-black ${getDebtTypeColor(debt.type)}`}>
                        {getDebtTypeText(debt.type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-gray-600 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Monto
                      </span>
                      <span className="font-black">
                        {formatCurrency(debt.currentAmount, userCurrency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-gray-600 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Persona
                      </span>
                      <span className="font-medium">
                        {debt.counterpartyName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-gray-600 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4" />
                        Descripción
                      </span>
                      <span className="font-medium text-right max-w-[200px] truncate">
                        {debt.description}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-gray-600">
                        Estado
                      </span>
                      <span className="font-medium">
                        {getStatusText(debt.status)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="brutal-button flex-1 min-h-[48px] py-3 px-6 flex items-center justify-center font-black uppercase tracking-wide border-black hover:bg-black hover:text-white transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="brutal-button flex-1 min-h-[48px] py-3 px-6 flex items-center justify-center font-black uppercase tracking-wide bg-red-500 hover:bg-red-600 text-white border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}