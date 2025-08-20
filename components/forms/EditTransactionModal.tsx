"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  X,
  DollarSign,
  FileText,
  Tag,
  Calendar,
  Folder,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote
} from "lucide-react";
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
        type: "income" | "expense" | "debt_payment" | "loan_received";
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
        date: new Date(formData.date).getTime(),
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
              <motion.div
                className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white relative overflow-hidden"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
                  >
                    <Edit className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Editar Transacción
                    </h2>
                    <p className="text-emerald-100 text-sm">Modifica los detalles de tu transacción</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Decorative line */}
              <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />

              {/* Content */}
              <motion.div
                className="p-6 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Transaction Type */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Tipo de Transacción
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          formData.type === 'income'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Ingreso</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          formData.type === 'expense'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                        }`}
                      >
                        <TrendingDown className="w-5 h-5" />
                        <span className="font-medium">Gasto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'debt_payment' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          formData.type === 'debt_payment'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">Pago de Deuda</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'loan_received' })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                          formData.type === 'loan_received'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <Banknote className="w-5 h-5" />
                        <span className="font-medium">Préstamo</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Amount and Description */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Monto *
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                          $
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Descripción *
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                        placeholder="¿En qué gastaste o ganaste?"
                      />
                    </div>
                  </motion.div>

                  {/* Category and Subcategory */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Folder className="w-5 h-5 text-purple-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Categoría
                        </label>
                      </div>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
                      >
                        <SelectTrigger className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white">
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

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Folder className="w-5 h-5 text-indigo-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Subcategoría
                        </label>
                      </div>
                      <Select
                        value={formData.subcategoryId}
                        onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                        disabled={!formData.categoryId}
                      >
                        <SelectTrigger className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white">
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
                  </motion.div>

                  {/* Date */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      <label className="text-lg font-bold text-gray-800">
                        Fecha *
                      </label>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white"
                    />
                  </motion.div>

                  {/* Notes and Tags */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-gray-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Notas
                        </label>
                      </div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-200 bg-white h-24 resize-none"
                        placeholder="Notas adicionales..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Tag className="w-5 h-5 text-pink-600" />
                        </div>
                        <label className="text-lg font-bold text-gray-800">
                          Etiquetas
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-200 bg-white"
                        placeholder="trabajo, personal, urgente"
                      />
                    </div>
                  </motion.div>
                </form>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold text-lg rounded-xl border-2 border-gray-300 hover:from-gray-200 hover:to-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-lg rounded-xl border-2 border-transparent hover:from-emerald-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5" />
                      Actualizar Transacción
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}