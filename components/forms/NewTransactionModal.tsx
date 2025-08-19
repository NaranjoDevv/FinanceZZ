"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PlusIcon, MinusIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface Category {
  _id: Id<"categories">;
  name: string;
}

interface Subcategory {
  _id: Id<"subcategories">;
  name: string;
}

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

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

export default function NewTransactionModal({
  isOpen,
  onClose,
  onTransactionCreated,
}: NewTransactionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    type: "expense",
    amount: "",
    description: "",
    categoryId: null,
    subcategoryId: null,
    date: new Date().toISOString().split("T")[0],
    notes: "",
    tags: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    currentUser?._id ? {
      userId: currentUser._id,
      categoryId: formData.categoryId || undefined
    } : "skip"
  ) || [];

  const handleClose = () => {
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "categoryId" && { subcategoryId: null }),
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser?._id) {
      console.error("Usuario no autenticado");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        userId: currentUser._id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        subcategoryId: formData.subcategoryId || undefined,
        date: new Date(formData.date).getTime(),
        notes: formData.notes || undefined,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag).join(",") : undefined,
      });

      setFormData({
        type: "expense",
        amount: "",
        description: "",
        categoryId: null,
        subcategoryId: null,
        date: new Date().toISOString().split("T")[0],
        notes: "",
        tags: "",
      });
      setErrors({});
      onClose();
      onTransactionCreated?.();
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const buttonClass = (type: "income" | "expense") => `
    brutal-button h-12 font-black uppercase tracking-wide transition-all duration-200
    ${formData.type === type
      ? type === "income"
        ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
        : "bg-red-500 hover:bg-red-600 text-white border-red-500"
      : "border-black hover:bg-black hover:text-white"
    }
  `;

  const inputClass = (isError: boolean) => `
    brutal-input h-12 font-medium border-black w-full px-4 py-3
    ${isError ? "border-red-500" : "border-black"}
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-[600px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-white">
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">Nueva Transacción</h2>
                    <p className="text-sm text-gray-600">Registra un nuevo ingreso o gasto</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div>
                  <Label className="block text-sm font-medium text-black mb-2">
                    Tipo de Transacción *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`px-4 py-3 border-4 font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 ${
                        formData.type === "income"
                          ? "border-black bg-green-500 text-white"
                          : "border-gray-300 bg-white text-black hover:border-black"
                      }`}
                      onClick={() => handleInputChange("type", "income")}
                      disabled={isSubmitting}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Ingreso
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-3 border-4 font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 ${
                        formData.type === "expense"
                          ? "border-black bg-red-500 text-white"
                          : "border-gray-300 bg-white text-black hover:border-black"
                      }`}
                      onClick={() => handleInputChange("type", "expense")}
                      disabled={isSubmitting}
                    >
                      <MinusIcon className="h-4 w-4" />
                      Gasto
                    </button>
                  </div>
                </div>

                {/* Amount and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="block text-sm font-medium text-black mb-2">
                      Monto *
                    </Label>
                    <input
                      id="amount"
                      type="number"
                      step="1000"
                      min="0"
                      placeholder="50000"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className={`w-full px-4 py-3 border-4 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all ${
                        errors.amount
                          ? "border-red-500 focus:border-red-500"
                          : "border-black focus:border-black"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description" className="block text-sm font-medium text-black mb-2">
                      Descripción *
                    </Label>
                    <input
                      id="description"
                      type="text"
                      placeholder="Ej: Almuerzo en restaurante"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={`w-full px-4 py-3 border-4 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 transition-all ${
                        errors.description
                          ? "border-red-500 focus:border-red-500"
                          : "border-black focus:border-black"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>

                  {/* Category and Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-bold text-black mb-2">
                        Categoría
                      </Label>
                      <Select
                        value={formData.categoryId || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "categoryId",
                            value as Id<"categories">
                          )
                        }
                      >
                        <SelectTrigger className="w-full px-4 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-black">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: Category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="block text-sm font-bold text-black mb-2">
                        Subcategoría
                      </Label>
                      <Select
                        value={formData.subcategoryId || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "subcategoryId",
                            value as Id<"subcategories">
                          )
                        }
                        disabled={!subcategories || subcategories.length === 0}
                      >
                        <SelectTrigger className={`w-full px-4 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-black ${!subcategories || subcategories.length === 0 ? "opacity-50" : ""
                          }`}>
                          <SelectValue
                            placeholder={
                              !subcategories || subcategories.length === 0
                                ? "Sin subcategorías"
                                : "Seleccionar subcategoría"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories?.map((subcategory: Subcategory) => (
                            <SelectItem key={subcategory._id} value={subcategory._id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <Label className="block text-sm font-bold text-black mb-2">
                      Fecha *
                    </Label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className={`w-full px-4 py-3 border-4 bg-white text-black font-bold focus:outline-none focus:ring-0 ${
                        errors.date
                          ? "border-red-500"
                          : "border-black"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm font-bold mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Notes and Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-bold text-black mb-2">
                        Notas
                      </Label>
                      <textarea
                        placeholder="Notas adicionales (opcional)"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        className="w-full h-24 px-4 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-black resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-bold text-black mb-2">
                        Etiquetas
                      </Label>
                      <input
                        type="text"
                        placeholder="Etiquetas separadas por comas (opcional)"
                        value={formData.tags}
                        onChange={(e) => handleInputChange("tags", e.target.value)}
                        className="w-full px-4 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-4 border-black bg-white text-black font-bold hover:bg-gray-100 focus:outline-none focus:ring-0 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-6 py-3 border-4 font-bold focus:outline-none focus:ring-0 disabled:opacity-50 ${
                        formData.type === "income"
                          ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
                          : "border-red-500 bg-red-500 text-white hover:bg-red-600"
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Guardando..." : formData.type === "income" ? "Crear Ingreso" : "Crear Gasto"}
                    </button>
                  </div>
                </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
