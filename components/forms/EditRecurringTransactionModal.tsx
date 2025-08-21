"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BaseModal } from "@/components/ui/BaseModal";
import { usePriceInput } from "@/lib/price-formatter";
import { useFormHandler } from "@/hooks/use-form-handler";
import { toast } from "sonner";
import { RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { Id } from "@/convex/_generated/dataModel";
import {
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PauseIcon,
  PlayIcon,
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

const TYPE_OPTIONS = [
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Gasto" },
  { value: "debt_payment", label: "Pago de Deuda" },
  { value: "loan_received", label: "Préstamo Recibido" },
];

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
  const { user } = useUser();
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
  }, [isOpen, transaction._id, resetForm, setValue]);

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="EDITAR TRANSACCIÓN RECURRENTE"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-4 border-black">
          <div className="flex items-center space-x-2">
            {transaction.isActive ? (
              <PlayIcon className="h-5 w-5 text-green-600" />
            ) : (
              <PauseIcon className="h-5 w-5 text-red-600" />
            )}
            <span className="font-black text-sm uppercase">
              {transaction.isActive ? "ACTIVA" : "PAUSADA"}
            </span>
          </div>
          <Button
            type="button"
            onClick={handleToggleActive}
            variant={transaction.isActive ? "destructive" : "default"}
            className="font-black uppercase"
          >
            {transaction.isActive ? "PAUSAR" : "ACTIVAR"}
          </Button>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <BrutalInput
            label="MONTO"
            icon={<CurrencyDollarIcon className="h-4 w-4" />}
            type="text"
            value={displayValue}
            onChange={(value) => {
              handleChange(value);
              updateField("amount", amountValue.toString());
            }}
            placeholder="0.00"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <BrutalInput
            label="DESCRIPCIÓN"
            type="text"
            value={formData.description}
            onChange={(value) => updateField("description", value)}
            placeholder="Descripción de la transacción"
            required
          />
        </div>

        {/* Transaction Type */}
        <div className="space-y-2">
          <BrutalSelect
            label="TIPO"
            value={formData.type}
            onChange={(value) => updateField("type", value)}
            placeholder="Selecciona el tipo"
            options={TYPE_OPTIONS}
          />
        </div>

        {/* Next Execution Date */}
        <div className="space-y-2">
          <BrutalInput
            label="PRÓXIMA EJECUCIÓN"
            icon={<CalendarIcon className="h-4 w-4" />}
            type="date"
            value={formData.nextExecutionDate}
            onChange={(value) => updateField("nextExecutionDate", value)}
            required
          />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <BrutalSelect
            label="FRECUENCIA"
            value={formData.recurringFrequency}
            onChange={(value) => updateField("recurringFrequency", value)}
            placeholder="Selecciona la frecuencia"
            options={FREQUENCY_OPTIONS}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <BrutalSelect
            label="CATEGORÍA"
            value={formData.categoryId}
            onChange={(value) => {
              updateField("categoryId", value);
              updateField("subcategoryId", ""); // Reset subcategory
            }}
            placeholder="Selecciona una categoría"
            options={filteredCategories?.map(cat => ({
              value: cat._id,
              label: cat.name
            })) || []}
          />
        </div>

        {/* Subcategory */}
        {formData.categoryId && subcategories && subcategories.length > 0 && (
          <div className="space-y-2">
            <BrutalSelect
              label="SUBCATEGORÍA"
              value={formData.subcategoryId}
              onChange={(value) => updateField("subcategoryId", value)}
              placeholder="Selecciona una subcategoría"
              options={subcategories.map(sub => ({
                value: sub._id,
                label: sub.name
              }))}
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <BrutalInput
            label="ETIQUETAS"
            icon={<TagIcon className="h-4 w-4" />}
            type="text"
            value={formData.tags}
            onChange={(value) => updateField("tags", value)}
            placeholder="Etiquetas separadas por comas"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <BrutalTextarea
            label="NOTAS"
            value={formData.notes}
            onChange={(value) => updateField("notes", value)}
            placeholder="Notas adicionales..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 font-black uppercase"
          >
            CANCELAR
          </Button>
          <Button
            type="submit"
            className="flex-1 font-black uppercase"
          >
            ACTUALIZAR
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}