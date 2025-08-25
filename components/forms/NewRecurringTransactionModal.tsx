"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { usePriceInput } from "@/lib/price-formatter";
import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";
import { useBilling } from "@/hooks/useBilling";
import { toast } from "sonner";
import {
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
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
                    <ArrowPathIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-wide">
                      NUEVA TRANSACCIÓN RECURRENTE
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
                    value={amountDisplay}
                    onChange={(value) => {
                      handleAmountChange(value);
                      updateField("amount", value);
                    }}
                    error={errors.amount}
                    required
                  />
                  <BrutalInput
                    label="DESCRIPCIÓN"
                    placeholder="¿En qué gastas recurrentemente?"
                    value={formData.description}
                    onChange={(value) => updateField("description", value)}
                    error={errors.description}
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
                      FECHA DE INICIO *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => updateField("startDate", e.target.value)}
                      className="w-full h-12 sm:h-14 px-4 py-3 bg-white border-4 border-black font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-gray-100 focus:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    />
                    {errors.startDate && (
                      <p className="text-red-600 text-sm font-bold">{errors.startDate}</p>
                    )}
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

                </form>
              </div>

              {/* Footer */}
              <div className="flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors uppercase tracking-wide"
                  disabled={isSubmitting}
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-black text-white border-4 border-black font-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_#666] uppercase tracking-wide"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "CREANDO..." : "CREAR RECURRENTE"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}