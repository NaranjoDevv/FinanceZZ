"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PencilIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Category, Subcategory } from "@/hooks/use-categories";

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

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

interface FormData {
  description: string;
  amount: string;
  type: 'income' | 'expense' | 'debt_payment' | 'loan_received';
  categoryId: string;
  subcategoryId: string;
  date: string;
  notes: string;
  tags: string;
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction
}: EditTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const categories = useQuery(api.categories.getCategories, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const subcategories = useQuery(api.categories.getSubcategories, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const [formData, setFormData] = useState<FormData>({
    description: "",
    amount: "",
    type: "expense",
    categoryId: "",
    subcategoryId: "",
    date: new Date().toISOString().split('T')[0] || "",
    notes: "",
    tags: ""
  });

  // Load transaction data when modal opens
  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.category?._id || "",
        subcategoryId: transaction.subcategory?._id || "",
        date: new Date(transaction.date).toISOString().split('T')[0] || "",
        notes: transaction.notes || "",
        tags: transaction.tags || ""
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !currentUser) return;

    try {
      setIsSubmitting(true);
      
      const updateData: {
        id: Id<"transactions">;
        userId: Id<"users">;
        description: string;
        amount: number;
        type: 'income' | 'expense' | 'debt_payment' | 'loan_received';
        date: number;
        categoryId?: Id<"categories">;
        subcategoryId?: Id<"subcategories">;
        notes?: string;
        tags?: string;
      } = {
        id: transaction._id as Id<"transactions">,
        userId: currentUser._id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: new Date(formData.date).getTime()
      };
      
      if (formData.categoryId) {
        updateData.categoryId = formData.categoryId as Id<"categories">;
      }
      
      if (formData.subcategoryId) {
        updateData.subcategoryId = formData.subcategoryId as Id<"subcategories">;
      }
      
      if (formData.notes) {
        updateData.notes = formData.notes;
      }
      
      if (formData.tags) {
        updateData.tags = formData.tags;
      }
      
      await updateTransaction(updateData);
      onClose();
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = (type: 'income' | 'expense') => {
    const isSelected = formData.type === type;
    const baseClass = "brutal-button flex-1 font-black uppercase tracking-wider transition-all duration-200";
    
    if (type === 'income') {
      return `${baseClass} ${isSelected 
        ? 'bg-green-500 text-white border-green-500' 
        : 'bg-white text-green-500 border-green-500 hover:bg-green-50'}`;
    } else {
      return `${baseClass} ${isSelected 
        ? 'bg-red-500 text-white border-red-500' 
        : 'bg-white text-red-500 border-red-500 hover:bg-red-50'}`;
    }
  };

  const filteredSubcategories = subcategories?.filter(
    (sub: Subcategory) => sub.categoryId === formData.categoryId
  ) || [];

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
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-blue-500 text-white border-b-4 border-black">
                <div className="flex items-center gap-3">
                  <PencilIcon className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    Editar Transacción
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
                        onClick={() => setFormData({ ...formData, type: "income" })}
                      >
                        + INGRESO
                      </Button>
                      <Button
                        type="button"
                        variant={formData.type === "expense" ? "default" : "outline"}
                        className={buttonClass("expense")}
                        onClick={() => setFormData({ ...formData, type: "expense" })}
                      >
                        - GASTO
                      </Button>
                    </div>
                  </div>

                  {/* Amount and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Monto *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="brutal-input w-full pl-12 pr-4 py-3"
                          placeholder="000"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                        <DocumentTextIcon className="w-4 h-4" />
                        Descripción *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="brutal-input w-full px-4 py-3"
                        placeholder="¿En qué gastaste o ganaste?"
                      />
                    </div>
                  </div>

                  {/* Category and Subcategory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                        <FolderIcon className="w-4 h-4" />
                        Categoría
                      </label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
                      >
                        <SelectTrigger className="brutal-input">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: Category) => (
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
                        value={formData.subcategoryId}
                        onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                        disabled={!formData.categoryId}
                      >
                        <SelectTrigger className="brutal-input">
                          <SelectValue placeholder="Sin subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSubcategories.map((subcategory: Subcategory) => (
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
                      <CalendarIcon className="w-4 h-4" />
                      Fecha *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="brutal-input w-full px-4 py-3"
                    />
                  </div>

                  {/* Notes and Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Notas
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="brutal-input w-full px-4 py-3 h-24 resize-none"
                        placeholder="Notas adicionales..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                        <TagIcon className="w-4 h-4" />
                        Etiquetas
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="brutal-input w-full px-4 py-3"
                        placeholder="trabajo, personal, urgente"
                      />
                    </div>
                  </div>
                </form>
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
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="brutal-button flex-1 bg-blue-500 text-white hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Actualizando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <PencilIcon className="w-4 h-4" />
                      Actualizar
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