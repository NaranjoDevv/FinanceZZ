"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Category, Subcategory } from "@/hooks/use-categories";
import { CurrencyDollarIcon, XMarkIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { usePriceInput } from "@/lib/price-formatter";

import { useFormHandler, createValidationRules, commonValidationRules } from "@/hooks/use-form-handler";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated?: () => void;
}

interface FormData {
  type: "income" | "expense";
  amount: string;
  description: string;
  categoryId: Id<"categories"> | null;
  subcategoryId: Id<"subcategories"> | null;
  date: string;
  notes: string;
  tags: string;
}

// Validation rules for the transaction form
const validationRules = createValidationRules<FormData>([
  {
    field: 'amount',
    validators: [commonValidationRules.required('Monto'), commonValidationRules.positiveAmount],
  },
  {
    field: 'description',
    validators: [commonValidationRules.required('Descripción')],
  },
  {
    field: 'date',
    validators: [commonValidationRules.required('Fecha')],
  },
]);

export default function NewTransactionModal({
  isOpen,
  onClose,
  onTransactionCreated,
}: NewTransactionModalProps) {
  const initialFormData: FormData = {
    type: "expense",
    amount: "",
    description: "",
    categoryId: null,
    subcategoryId: null,
    date: new Date().toISOString().split("T")[0] || "",
    notes: "",
    tags: "",
  };

  // Price input handler
  const priceInput = usePriceInput("", "COP");

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    resetForm
  } = useFormHandler<FormData>({
    initialData: initialFormData,
    validationRules,
    onSuccess: () => {
      onClose();
      onTransactionCreated?.();
    },
    successMessage: "Transacción creada exitosamente",
    errorMessage: "Error al crear la transacción"
  });

  const currentUser = useQuery(api.users.getCurrentUser);

  const createTransaction = useMutation(api.transactions.createTransaction);
  const categories = useQuery(
    api.categories.getUserCategories,
    currentUser?._id ? {
      userId: currentUser._id,
      isExpense: formData.type === "expense"
    } : "skip"
  ) || [];

  const subcategories = useQuery(
    api.categories.getSubcategories,
    currentUser?._id && formData.categoryId ? {
      userId: currentUser._id,
      categoryId: formData.categoryId
    } : "skip"
  ) || [];

  const submitTransaction = async (data: FormData) => {
    if (!currentUser?._id) {
      throw new Error("Usuario no autenticado");
    }

    const transactionData: {
      userId: Id<"users">;
      type: "income" | "expense";
      amount: number;
      description: string;
      date: number;
      categoryId?: Id<"categories">;
      subcategoryId?: Id<"subcategories">;
      notes?: string;
      tags?: string;
    } = {
      userId: currentUser._id,
      type: data.type,
      amount: priceInput.rawValue,
      description: data.description,
      date: new Date(data.date).getTime()
    };

    if (data.categoryId) {
      transactionData.categoryId = data.categoryId;
    }

    if (data.subcategoryId) {
      transactionData.subcategoryId = data.subcategoryId;
    }

    if (data.notes) {
      transactionData.notes = data.notes;
    }

    if (data.tags) {
      const processedTags = data.tags.split(",").map(tag => tag.trim()).filter(tag => tag).join(",");
      if (processedTags) {
        transactionData.tags = processedTags;
      }
    }

    await createTransaction(transactionData);
  };

  const handleClose = () => {
    resetForm();
    priceInput.setValue(0);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      priceInput.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);



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
              <div className="flex items-center justify-between p-4 sm:p-6  border-black bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-3 bg-black text-white  border-black">
                    <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-black">
                      NUEVA TRANSACCIÓN
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
                    value={priceInput.displayValue}
                    onChange={(value) => {
                      priceInput.handleChange(value);
                      updateField("amount", priceInput.rawValue.toString());
                    }}
                    error={errors.amount}
                    required
                  />
                  <BrutalInput
                    label="DESCRIPCIÓN"
                    placeholder="¿En qué gastaste o ganaste?"
                    value={formData.description}
                    onChange={(value) => updateField("description", value)}
                    error={errors.description}
                    required
                  />
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <BrutalSelect
                    label="CATEGORÍA"
                    placeholder="Seleccionar categoría"
                    value={formData.categoryId || ""}
                    onChange={(value) => updateField("categoryId", value as Id<"categories">)}
                    options={categories.map((category: Category) => ({ value: category._id, label: category.name }))}
                  />
                  <BrutalSelect
                    label="SUBCATEGORÍA"
                    placeholder={!subcategories || subcategories.length === 0 ? "Sin subcategorías" : "Seleccionar subcategoría"}
                    value={formData.subcategoryId || ""}
                    onChange={(value) => updateField("subcategoryId", value as Id<"subcategories">)}
                    disabled={!subcategories || subcategories.length === 0}
                    options={subcategories?.map((subcategory: Subcategory) => ({ value: subcategory._id, label: subcategory.name })) || []}
                  />
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <label className="block text-sm font-black text-black uppercase tracking-wide">
                    FECHA *
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="w-full h-12 sm:h-14 px-4 py-3 bg-white border-4 border-black font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-gray-100 focus:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  />
                  {errors.date && (
                    <p className="text-red-600 text-sm font-bold">{errors.date}</p>
                  )}
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
              </div>

              {/* Footer */}
              <div className="flex gap-4 p-4 sm:p-6 border-t-4 border-black bg-white">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 py-3 border-4 border-black font-black text-black hover:bg-gray-100 transition-colors"
                  disabled={isSubmitting}
                >
                  CANCELAR
                </Button>
                <Button
                  onClick={() => handleSubmit(submitTransaction)}
                  className="flex-1 py-3 bg-black text-white border-4 border-black font-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_#666]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "CREANDO..." : "CREAR TRANSACCIÓN"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}