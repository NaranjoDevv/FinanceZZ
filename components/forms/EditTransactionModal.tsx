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
import { formatPriceInput, parseFormattedPrice } from "@/lib/price-formatter";


import {
  Edit,
  DollarSign,
  FileText,
  Tag,
  Calendar,
  Folder,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  X
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
        amount: formatPriceInput(transaction.amount.toString(), 'COP'),
        type: transaction.type,
        categoryId: transaction.category?._id || "",
        subcategoryId: transaction.subcategory?._id || "",
        date: new Date(transaction.date).toISOString().split('T')[0] || "",
        notes: transaction.notes || "",
        tags: transaction.tags || ""
      });
    }
  }, [transaction, isOpen]);

  const handleAmountChange = (value: string) => {
    const formattedValue = formatPriceInput(value, 'COP');
    setFormData((prev) => ({
      ...prev,
      amount: formattedValue
    }));
  };

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
        amount: parseFormattedPrice(formData.amount, 'COP'),
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
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 md:p-4 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div
                className="flex items-center justify-between p-4 md:p-6 bg-white text-black border-b-4 border-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <motion.div
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="p-2 md:p-3 bg-white text-black border-2 border-black"
                  >
                    <Edit className="w-5 h-5 md:w-6 md:h-6" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                      EDITAR TRANSACCIÓN
                    </h2>
                    <p className="text-black font-bold text-sm uppercase">MODIFICA LOS DETALLES</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 md:p-3 bg-white text-black border-2 border-black hover:bg-gray-100 transition-colors font-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div
                className="p-4 md:p-6 bg-white max-h-[calc(95vh-200px)] md:max-h-none overflow-y-auto md:overflow-visible"
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
                    <div className="flex items-center gap-3 md:gap-4 mb-4">
                      <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                        TIPO DE TRANSACCIÓN
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'income' })}
                        className={`p-3 md:p-4 border-4 border-black transition-all duration-200 flex items-center gap-3 font-black uppercase ${formData.type === 'income'
                            ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                      >
                        <TrendingUp className="w-5 h-5" />
                        <span>INGRESO</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                        className={`p-3 md:p-4 border-4 border-black transition-all duration-200 flex items-center gap-3 font-black uppercase ${formData.type === 'expense'
                            ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                      >
                        <TrendingDown className="w-5 h-5" />
                        <span>GASTO</span>
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          MONTO *
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black font-black text-xl">
                          $
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.amount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 text-xl font-black border-4 border-black bg-white text-black placeholder-gray-500 focus:bg-gray-100 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="5,000"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <FileText className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          DESCRIPCIÓN *
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-4 text-lg font-bold border-4 border-black bg-white text-black placeholder-gray-500 focus:bg-gray-100 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="¿EN QUÉ GASTASTE O GANASTE?"
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
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <Folder className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          CATEGORÍA
                        </label>
                      </div>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: "" })}
                      >
                        <SelectTrigger className="w-full px-4 py-4 text-lg font-bold border-4 border-black bg-white text-black focus:bg-gray-100 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <SelectValue placeholder="SELECCIONAR CATEGORÍA" />
                        </SelectTrigger>
                        <SelectContent className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          {categories?.map((category: Category) => (
                            <SelectItem key={category._id} value={category._id} className="font-bold text-black hover:bg-gray-100 focus:bg-gray-100">
                              {category.name.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <Folder className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          SUBCATEGORÍA
                        </label>
                      </div>
                      <Select
                        value={formData.subcategoryId}
                        onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                        disabled={!formData.categoryId}
                      >
                        <SelectTrigger className="w-full px-4 py-4 text-lg font-bold border-4 border-black bg-white text-black focus:bg-gray-100 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">
                          <SelectValue placeholder="SIN SUBCATEGORÍA" />
                        </SelectTrigger>
                        <SelectContent className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          {filteredSubcategories.map((subcategory: Subcategory) => (
                            <SelectItem key={subcategory._id} value={subcategory._id} className="font-bold text-black hover:bg-gray-100 focus:bg-gray-100">
                              {subcategory.name.toUpperCase()}
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          FECHA *
                        </label>
                      </div>
                      <input
                        type="date"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full h-14 px-4 py-3 bg-white border-4 border-black font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-gray-100 focus:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                  </motion.div>

                  {/* Notes and Tags */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          NOTAS
                        </label>
                      </div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-4 text-lg font-bold border-4 border-black bg-white text-black placeholder-gray-500 focus:bg-gray-100 focus:outline-none transition-colors h-24 resize-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="NOTAS ADICIONALES..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-white text-black border-2 border-black">
                          <Tag className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <label className="text-lg md:text-xl font-black text-black uppercase tracking-wide">
                          ETIQUETAS
                        </label>
                      </div>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-4 text-lg font-bold border-4 border-black bg-white text-black placeholder-gray-500 focus:bg-gray-100 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="TRABAJO, PERSONAL, URGENTE"
                      />
                    </div>
                  </motion.div>
                </form>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white border-t-4 border-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl font-black text-black bg-white border-4 border-black hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                  CANCELAR
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl font-black text-white bg-black border-4 border-black hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 md:w-6 md:h-6 border-4 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      ACTUALIZANDO...
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5 md:w-6 md:h-6" />
                      ACTUALIZAR TRANSACCIÓN
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