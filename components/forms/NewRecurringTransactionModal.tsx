"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BaseModal } from "@/components/ui/BaseModal";
import { usePriceInput } from "@/lib/price-formatter";
import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";
import { useBilling } from "@/hooks/useBilling";
import { toast } from "sonner";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface NewRecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  type: "income" | "expense" | "debt_payment" | "loan_received";
  amount: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
}

const INITIAL_FORM_DATA: FormData = {
  type: "expense",
  amount: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  recurringFrequency: "monthly",
  startDate: new Date().toISOString().split('T')[0] || '',
};

const VALIDATION_RULES = createValidationRules<FormData>([
  {
    field: "amount",
    validators: [commonValidationRules.required("Monto"), commonValidationRules.positiveAmount]
  },
  {
    field: "description",
    validators: [commonValidationRules.required("Descripción"), commonValidationRules.minLength(3)]
  },
  {
    field: "type",
    validators: [commonValidationRules.required("Tipo")]
  },
  {
    field: "recurringFrequency",
    validators: [commonValidationRules.required("Frecuencia")]
  },
  {
    field: "startDate",
    validators: [commonValidationRules.required("Fecha de inicio")]
  }
]);

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

export default function NewRecurringTransactionModal({
  isOpen,
  onClose,
}: NewRecurringTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createRecurringTransaction = useMutation(api.recurringTransactions.createRecurringTransaction);
  const currentUser = useQuery(api.users.getCurrentUser);
  const { setShowSubscriptionPopup, setCurrentLimitType } = useBilling();
  
  const { formData, errors, updateField, validateForm, resetForm } = useFormHandler({
    initialData: INITIAL_FORM_DATA,
    validationRules: VALIDATION_RULES
  });
  
  const categories = useQuery(api.categories.getCategories,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const subcategories = useQuery(api.categories.getSubcategories, 
    formData.categoryId && currentUser?._id ? { 
      categoryId: formData.categoryId as Id<"categories">, 
      userId: currentUser._id 
    } : "skip"
  );

  const { rawValue: amountValue, displayValue: amountDisplay, handleChange: handleAmountChange } = usePriceInput(
    formData.amount
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const startDate = new Date(formData.startDate);
      const nextExecutionDate = new Date(startDate);
      
      // Calculate next execution date based on frequency
      switch (formData.recurringFrequency) {
        case "daily":
          nextExecutionDate.setDate(nextExecutionDate.getDate() + 1);
          break;
        case "weekly":
          nextExecutionDate.setDate(nextExecutionDate.getDate() + 7);
          break;
        case "monthly":
          nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
          break;
        case "yearly":
          nextExecutionDate.setFullYear(nextExecutionDate.getFullYear() + 1);
          break;
      }

      const transactionData: {
        type: "income" | "expense" | "debt_payment" | "loan_received";
        amount: number;
        description: string;
        recurringFrequency: "daily" | "weekly" | "monthly" | "yearly";
        nextExecutionDate: number;
        categoryId?: Id<"categories">;
        subcategoryId?: Id<"subcategories">;
      } = {
        type: formData.type,
        amount: amountValue,
        description: formData.description,
        recurringFrequency: formData.recurringFrequency,
        nextExecutionDate: nextExecutionDate.getTime(),
      };

      if (formData.categoryId) {
        transactionData.categoryId = formData.categoryId as Id<"categories">;
      }
      if (formData.subcategoryId) {
        transactionData.subcategoryId = formData.subcategoryId as Id<"subcategories">;
      }

      await createRecurringTransaction(transactionData);

      toast.success("Transacción recurrente creada exitosamente");
      resetForm();
      onClose();
    } catch (error: Error | unknown) {
      console.error("Error creating recurring transaction:", error);
      
      // Check if it's a billing limit error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("límite de") && errorMessage.includes("recurrentes")) {
        setCurrentLimitType("recurring_transactions");
        setShowSubscriptionPopup(true);
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories?.filter(cat => 
    formData.type === "income" ? !cat.isExpense : cat.isExpense
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="NUEVA TRANSACCIÓN RECURRENTE">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Tipo y Monto en una fila */}
        <div className="grid grid-cols-2 gap-3">
          <BrutalSelect
            label="TIPO *"
            value={formData.type}
            onChange={(value) => updateField("type", value)}
            placeholder="Selecciona el tipo"
            options={TYPE_OPTIONS}
          />
          <BrutalInput
            label="MONTO *"
            icon={<CurrencyDollarIcon className="h-4 w-4" />}
            type="text"
            value={amountDisplay}
            onChange={(value) => {
              handleAmountChange(value);
              updateField("amount", value);
            }}
            placeholder="$0.00"
            error={errors.amount}
            required
          />
        </div>

        {/* Descripción */}
        <BrutalInput
          label="DESCRIPCIÓN *"
          type="text"
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          placeholder="Ej: Salario mensual, Renta, Suscripción Netflix"
          error={errors.description}
          required
        />

        {/* Frecuencia y Fecha de inicio en una fila */}
        <div className="grid grid-cols-2 gap-3">
          <BrutalSelect
            label="FRECUENCIA *"
            icon={<ClockIcon className="h-4 w-4" />}
            value={formData.recurringFrequency}
            onChange={(value) => updateField("recurringFrequency", value)}
            placeholder="Selecciona la frecuencia"
            options={FREQUENCY_OPTIONS}
          />
          <BrutalInput
            label="FECHA DE INICIO *"
            icon={<CalendarIcon className="h-4 w-4" />}
            type="date"
            value={formData.startDate}
            onChange={(value) => updateField("startDate", value)}
            error={errors.startDate}
            required
          />
        </div>

        {/* Categoría y Subcategoría en una fila */}
        <div className="grid grid-cols-2 gap-3">
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
          {formData.categoryId && subcategories && subcategories.length > 0 ? (
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
          ) : (
            <div></div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t-4 border-black pt-3 mt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="brutal-button flex-1 bg-white text-black border-black hover:bg-gray-100"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="brutal-button flex-1 bg-black text-white border-black hover:bg-white hover:text-black"
            >
              {isSubmitting ? "CREANDO..." : "CREAR RECURRENTE"}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}