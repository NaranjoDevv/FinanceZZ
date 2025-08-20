"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency, toCurrency } from "@/lib/currency";
import { BrutalConfirmationModal } from "@/components/ui/brutal-confirmation-modal";
import {
  CurrencyDollarIcon,
  UserIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

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

  const itemDetails = debt ? (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-wider text-gray-600">
          Tipo
        </span>
        <span className={`font-black ${getDebtTypeColor(debt.type)}`}>
          {getDebtTypeText(debt.type)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-black uppercase tracking-wider text-gray-600">
            Monto
          </span>
        </div>
        <span className="font-black">
          {formatCurrency(debt.currentAmount, userCurrency)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-black uppercase tracking-wider text-gray-600">
            Persona
          </span>
        </div>
        <span className="font-medium">
          {debt.counterpartyName}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-black uppercase tracking-wider text-gray-600">
            Descripción
          </span>
        </div>
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
    </div>
  ) : null;

  return (
    <BrutalConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Eliminar Deuda"
      description="¿Estás seguro? Esta acción no se puede deshacer. La deuda será eliminada permanentemente."
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      isLoading={isDeleting}
      itemDetails={itemDetails}
    />
  );
}