"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { usePriceInput } from "@/lib/price-formatter";
import { useFormHandler } from "@/hooks/use-form-handler";
import { toast } from "sonner";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { Id } from "@/convex/_generated/dataModel";
import {
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

interface EditRecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: RecurringTransaction;
}

interface FormData {
  type: "income" | "expense" | "debt_payment" | "loan_received";
  amount: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
  nextExecutionDate: string;
  tags: string;
  notes: string;
  isActive: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

export default function EditRecurringTransactionModal({
  isOpen,
  onClose,
  transaction,
}: EditRecurringTransactionModalProps) {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateRecurringTransaction = useMutation(api.recurringTransactions.updateRecurringTransaction);
  const toggleRecurringTransaction = useMutation(api.recurringTransactions.toggleRecurringTransaction);
  
  const initialData: FormData = useMemo(() => ({
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description,
    categoryId: transaction.categoryId || "",
    subcategoryId: transaction.subcategoryId || "",
    recurringFrequency: transaction.recurringFrequency,
    nextExecutionDate: transaction.nextExecutionDate ? new Date(transaction.nextExecutionDate).toISOString().split('T')[0] || '' : new Date().toISOString().split('T')[0] || '',
    tags: transaction.tags || "",
    notes: transaction.notes || "",
    isActive: transaction.isActive,
  }), [transaction]);

  const { formData, updateField, resetForm } = useFormHandler({
    initialData,
  });

  const categories = useQuery(api.categories.getCategories, currentUser?._id ? { userId: currentUser._id } : "skip");
  const subcategories = useQuery(
    api.categories.getSubcategories,
    currentUser?._id && formData.categoryId
      ? { categoryId: formData.categoryId as Id<"categories">, userId: currentUser._id }
      : "skip"
  );

  const { rawValue: amountValue, displayValue, setValue, handleChange } = usePriceInput(
    transaction.amount.toString(),
    'COP'
  );

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setValue(transaction.amount);
    }
  }, [isOpen, transaction._id, transaction.amount, resetForm, setValue]);

  const filteredCategories = categories?.filter(cat => 
    formData.type === "income" ? !cat.isExpense : cat.isExpense
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?._id) {
      toast.error("Usuario no autenticado");
      return;
    }
    
    try {
      const updateData: {
        id: Id<"recurringTransactions">;
        type?: "income" | "expense" | "debt_payment" | "loan_received";
        amount?: number;
        description?: string;
        categoryId?: Id<"categories">;
        subcategoryId?: Id<"subcategories">;
        recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
        nextExecutionDate?: number;
        tags?: string;
        notes?: string;
      } = {
        id: transaction._id,
        type: formData.type,
        amount: amountValue,
        description: formData.description,
        recurringFrequency: formData.recurringFrequency,
        nextExecutionDate: new Date(formData.nextExecutionDate).getTime(),
      };

      if (formData.categoryId) {
        updateData.categoryId = formData.categoryId as Id<"categories">;
      }
      if (formData.subcategoryId) {
        updateData.subcategoryId = formData.subcategoryId as Id<"subcategories">;
      }
      if (formData.tags) {
        updateData.tags = formData.tags;
      }
      if (formData.notes) {
        updateData.notes = formData.notes;
      }

      await updateRecurringTransaction(updateData);
      
      toast.success("Transacción recurrente actualizada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating recurring transaction:", error);
      toast.error("Error al actualizar la transacción recurrente");
    }
  };

  const handleToggleActive = async () => {
    try {
      await toggleRecurringTransaction({
        id: transaction._id,
        isActive: !transaction.isActive,
      });
      
      toast.success(
        transaction.isActive 
          ? "Transacción recurrente pausada" 
          : "Transacción recurrente activada"
      );
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      toast.error("Error al cambiar el estado de la transacción");
    }
  };

  const handleClose = () => {
    resetForm();
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
                  <div className="p-2 sm:p-3 bg-black text-white border-4 border-black">
                    <PencilSquareIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-wide">
                      EDITAR TRANSACCIÓN RECURRENTE
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

              {/* Form Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center space-x-2">
                    {transaction.isActive ? (
                      <PlayIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <PauseIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-black text-sm uppercase tracking-wide">
                      {transaction.isActive ? "ACTIVA" : "PAUSADA"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={handleToggleActive}
                    className={`font-black uppercase text-sm px-4 py-2 border-4 transition-colors ${
                      transaction.isActive 
                        ? "bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white" 
                        : "bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    {transaction.isActive ? "PAUSAR" : "ACTIVAR"}
                  </Button>
                </div>

                {/* Transaction Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-black text-black uppercase tracking-wide">
                    TIPO DE TRANSACCIÓN
                  </label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => updateField("type", "income")}
                      className={`flex-1 py-3 sm:py-4 border-4 font-black text-base sm:text-lg transition-all ${formData.type === "income"
                        ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_#000]"
                        : "bg-white text-black border-black hover:bg-gray-100"
                        }`}
                    >
                      <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      INGRESO
                    </Button>
                    <Button
                      type="button"
                      onClick={() => updateField("type", "expense")}
                      className={`flex-1 py-3 sm:py-4 border-4 font-black text-base sm:text-lg transition-all ${formData.type === "expense"
                        ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_#000]"
                        : "bg-white text-black border-black hover:bg-gray-100"
                        }`}
                    >
                      <MinusIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      GASTO
                    </Button>
                  </div>
                </div>

                {/* Amount and Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <BrutalInput
                    label="MONTO"
                    type="text"
                    placeholder="$5,000"
                    value={displayValue}
                    onChange={(value) => {
                      handleChange(value);
                      updateField("amount", amountValue.toString());
                    }}
                    required
                  />
                  <BrutalInput
                    label="DESCRIPCIÓN"
                    placeholder="¿En qué gastas recurrentemente?"
                    value={formData.description}
                    onChange={(value) => updateField("description", value)}
                    required
                  />
                </div>


                {/* Frequency and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <BrutalSelect
                    label="FRECUENCIA"
                    placeholder="Selecciona la frecuencia"
                    value={formData.recurringFrequency}
                    onChange={(value) => updateField("recurringFrequency", value)}
                    options={FREQUENCY_OPTIONS}
                  />
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-black uppercase tracking-wide">
                      PRÓXIMA EJECUCIÓN *
                    </label>
                    <input
                      type="date"
                      value={formData.nextExecutionDate || ''}
                      onChange={(e) => updateField("nextExecutionDate", e.target.value)}
                      className="w-full h-12 sm:h-14 px-4 py-3 bg-white border-4 border-black font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-gray-100 focus:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <BrutalSelect
                    label="CATEGORÍA"
                    placeholder="Seleccionar categoría"
                    value={formData.categoryId || ""}
                    onChange={(value) => {
                      updateField("categoryId", value);
                      updateField("subcategoryId", "");
                    }}
                    options={filteredCategories?.map(cat => ({ value: cat._id, label: cat.name })) || []}
                  />
                  <BrutalSelect
                    label="SUBCATEGORÍA"
                    placeholder={!subcategories || subcategories.length === 0 ? "Sin subcategorías" : "Seleccionar subcategoría"}
                    value={formData.subcategoryId || ""}
                    onChange={(value) => updateField("subcategoryId", value)}
                    disabled={!subcategories || subcategories.length === 0}
                    options={subcategories?.map(sub => ({ value: sub._id, label: sub.name })) || []}
                  />
                </div>

                {/* Notes and Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <BrutalTextarea
                    label="NOTAS"
                    placeholder="Notas adicionales..."
                    value={formData.notes}
                    onChange={(value) => updateField("notes", value)}
                    rows={3}
                  />
                  <BrutalInput
                    label="ETIQUETAS"
                    placeholder="trabajo, personal, urgente"
                    value={formData.tags}
                    onChange={(value) => updateField("tags", value)}
                  />
                </div>

                </form>
              </div>

              {/* Footer */}
              <div className="flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide"
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-black text-white border-4 border-black font-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_#666] uppercase tracking-wide"
                >
                  ACTUALIZAR TRANSACCIÓN
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}