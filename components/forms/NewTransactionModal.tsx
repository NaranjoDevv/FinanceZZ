"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Category, Subcategory } from "@/hooks/use-categories";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  TagIcon,
  DocumentTextIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { FolderIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="brutal-card p-0 border-4 border-black shadow-brutal max-w-3xl w-full sm:max-w-2xl overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Nueva Transacción</DialogTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key="new-transaction"
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-white">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="w-6 h-6" />
                <h2 className="text-xl font-black uppercase tracking-wider">
                  Nueva Transacción
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transaction Type */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <DocumentTextIcon className="w-4 h-4" />
                    Tipo de Transacción
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={formData.type === "income" ? "default" : "outline"}
                      className={buttonClass("income")}
                      onClick={() => handleInputChange("type", "income")}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Ingreso
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === "expense" ? "default" : "outline"}
                      className={buttonClass("expense")}
                      onClick={() => handleInputChange("type", "expense")}
                    >
                      <MinusIcon className="w-4 h-4 mr-2" />
                      Gasto
                    </Button>
                  </div>
                </div>

                {/* Amount and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      Monto *
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        placeholder="5000"
                        value={formData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        className={`${inputClass(!!errors.amount)} pl-12`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-red-600 text-xs font-black uppercase tracking-wide">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <PencilSquareIcon className="w-4 h-4" />
                      Descripción *
                    </label>
                    <Input
                      type="text"
                      placeholder="¿En qué gastaste o ganaste?"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={inputClass(!!errors.description)}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-xs font-black uppercase tracking-wide">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <FolderIcon className="w-4 h-4" />
                      Categoría
                    </label>
                    <Select
                      value={formData.categoryId || ""}
                      onValueChange={(value) =>
                        handleInputChange(
                          "categoryId",
                          value as Id<"categories">
                        )
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <FolderIcon className="w-4 h-4" />
                      Subcategoría
                    </label>
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
                      <SelectTrigger className={!subcategories || subcategories.length === 0 ? "opacity-50" : ""}>
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
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Fecha *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={inputClass(!!errors.date)}
                  />
                  {errors.date && (
                    <p className="text-red-600 text-xs font-black uppercase tracking-wide">
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Notes and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <DocumentTextIcon className="w-4 h-4" />
                      Notas
                    </label>
                    <textarea
                      placeholder="Notas adicionales..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      className="brutal-textarea font-medium border-black w-full h-20 resize-none px-4 py-3"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                      <TagIcon className="w-4 h-4" />
                      Etiquetas
                    </label>
                    <Input
                      type="text"
                      placeholder="trabajo, personal, urgente"
                      value={formData.tags}
                      onChange={(e) => handleInputChange("tags", e.target.value)}
                      className="brutal-input h-12 font-medium border-black px-4 py-3"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t-4 border-black">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="brutal-button flex-1 h-12 font-black uppercase tracking-wide border-black hover:bg-black hover:text-white transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className={buttonClass(formData.type) + " flex-1"}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : formData.type === "income" ? "Crear Ingreso" : "Crear Gasto"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}