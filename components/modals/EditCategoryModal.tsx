"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

import {
  PencilIcon,
  XMarkIcon,
  DocumentTextIcon,
  TagIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { useCategories, Category } from "@/hooks/use-categories";
import { toast } from "sonner";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

interface FormData {
  name: string;
  icon: string;
  color: string;
  isExpense: boolean;
}

const CATEGORY_ICONS = [
  "🏠", "🍔", "🚗", "🎬", "💊", "🎓", "👕", "✈️", "🎮", "💰",
  "🎨", "🏋️", "📚", "🎵", "🌱", "⚡", "🔧", "🎯", "🚀", "💎",
  "🌟", "🔥", "💡", "🎪", "🎭", "🎲", "🎸", "🎺", "🎻", "🥁"
];

const CATEGORY_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#C026D3", "#E11D48", "#DC2626", "#7C2D12",
  "#365314", "#064E3B", "#164E63", "#1E3A8A", "#312E81", "#581C87"
];

export function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const { updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    icon: "📁",
    color: "#6B7280",
    isExpense: true,
  });

  // Load category data when modal opens
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        icon: category.icon || "📁",
        color: category.color || "#6B7280",
        isExpense: category.isExpense,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    try {
      setIsSubmitting(true);
      await updateCategory(category._id, {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        isExpense: formData.isExpense,
      });
      toast.success("Categoría actualizada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar la categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = (type: 'income' | 'expense') => {
    const isSelected = formData.isExpense === (type === 'expense');
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

  if (!category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex items-center justify-between p-6 bg-purple-500 text-white border-b-4 border-black">
              <div className="flex items-center gap-3">
                <PencilIcon className="w-6 h-6" />
                <h2 className="text-xl font-black uppercase tracking-wider">
                  Editar Categoría
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
                {/* Category Type */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <DocumentTextIcon className="w-4 h-4" />
                    Tipo de Categoría
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={!formData.isExpense ? "default" : "outline"}
                      className={buttonClass("income")}
                      onClick={() => setFormData({ ...formData, isExpense: false })}
                    >
                      + INGRESO
                    </Button>
                    <Button
                      type="button"
                      variant={formData.isExpense ? "default" : "outline"}
                      className={buttonClass("expense")}
                      onClick={() => setFormData({ ...formData, isExpense: true })}
                    >
                      - GASTO
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <DocumentTextIcon className="w-4 h-4" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="brutal-input w-full px-4 py-3"
                    placeholder="Ej. Alimentación, Transporte, Salario..."
                  />
                </div>

                {/* Icon Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <TagIcon className="w-4 h-4" />
                    Icono
                  </label>
                  <div className="grid grid-cols-10 gap-2 p-4 border-4 border-black bg-gray-50">
                    {CATEGORY_ICONS.map((icon) => (
                      <motion.button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl border transition-all duration-200 ${formData.icon === icon
                          ? "border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-3">
                    <SwatchIcon className="w-4 h-4" />
                    Color
                  </label>
                  <div className="grid grid-cols-12 gap-2 p-4 border-4 border-black bg-gray-50">
                    {CATEGORY_COLORS.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 border-2 transition-all duration-200 ${formData.color === color
                          ? "border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-110"
                          : "border-gray-300 hover:border-gray-400"
                          }`}
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-4 pt-6 border-t-4 border-black"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    className="brutal-button flex-1 bg-white text-black border-black hover:bg-gray-100 font-black uppercase tracking-wider"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="brutal-button flex-1 bg-purple-500 text-white border-purple-500 hover:bg-purple-600 font-black uppercase tracking-wider"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Actualizando..." : "Actualizar Categoría"}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}