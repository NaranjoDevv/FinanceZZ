"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'debt_payment' | 'loan_received';
  date: number;
  category?: {
    name: string;
    _id: string;
  } | null;
  subcategory?: {
    name: string;
    _id: string;
  } | null;
  notes?: string;
  tags?: string;
}

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function DeleteTransactionModal({
  isOpen,
  onClose,
  transaction
}: DeleteTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  const handleDelete = async () => {
    if (!transaction || !currentUser) return;

    try {
      setIsDeleting(true);
      await deleteTransaction({
        id: transaction._id as Id<"transactions">,
        userId: currentUser._id
      });
      onClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-red-500 text-white border-b-4 border-black">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    Eliminar Transacción
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  className="brutal-button p-2 bg-white text-black hover:bg-gray-100 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Decorative line */}
              <motion.div
                className="w-full h-1 bg-black"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Content */}
              <motion.div
                className="p-6 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-none flex items-center justify-center">
                    <TrashIcon className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide mb-2">
                      ¿Estás seguro?
                    </h3>
                    <p className="text-gray-600 font-medium mb-4">
                      Esta acción no se puede deshacer. Se eliminará permanentemente la siguiente transacción:
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-gray-50 border-2 border-gray-200 p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm uppercase tracking-wide">
                        {transaction.description}
                      </span>
                      <span className={`font-black text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {transaction.category?.name || 'Sin categoría'} • {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    {transaction.notes && (
                      <div className="text-xs text-gray-500 mt-2">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-3 p-6 bg-gray-50 border-t-4 border-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Button
                  type="button"
                  onClick={onClose}
                  className="brutal-button flex-1 bg-white text-black border-2 border-black hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="brutal-button flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Eliminando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrashIcon className="w-4 h-4" />
                      Eliminar
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}