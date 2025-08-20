"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { BrutalConfirmationModal } from "@/components/ui/brutal-confirmation-modal";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/currency";
import {
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    _id: string;
    description: string;
    amount: number;
    type: "income" | "expense" | "debt_payment" | "loan_received";
    date: number;
    categoryId?: string;
  };
}

export default function DeleteTransactionModal({
  isOpen,
  onClose,
  transaction,
}: DeleteTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useMutation(api.transactions.deleteTransaction);
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleDelete = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteMutation({
        id: transaction._id as Id<"transactions">,
        userId: currentUser._id
      });
      toast.success("Transacción eliminada exitosamente");
      onClose();
    } catch (error) {
      toast.error("Error al eliminar la transacción");
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const itemDetails = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Descripción:</span>
        </div>
        <span className="font-bold text-black text-sm">{transaction.description}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Monto:</span>
        </div>
        <span className={`font-bold text-sm ${
          transaction.type === "income" || transaction.type === "loan_received" ? "text-green-600" : "text-red-600"
        }`}>
          {transaction.type === "income" || transaction.type === "loan_received" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Fecha:</span>
        </div>
        <span className="font-bold text-black text-sm">
          {new Date(transaction.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Tipo:</span>
        </div>
        <span className="font-bold text-black text-sm">
          {transaction.type === "income" ? "Ingreso" : 
           transaction.type === "expense" ? "Gasto" :
           transaction.type === "debt_payment" ? "Pago de Deuda" : "Préstamo Recibido"}
        </span>
      </div>
    </div>
  );

  return (
    <BrutalConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Eliminar Transacción"
      description="¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      isLoading={isDeleting}
      itemDetails={itemDetails}
    />
  );
}