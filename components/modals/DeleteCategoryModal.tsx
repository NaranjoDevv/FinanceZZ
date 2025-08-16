"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useCategories, Category } from "@/hooks/use-categories";
import { toast } from "sonner";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const { deleteCategory } = useCategories();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!category) return;

    try {
      setIsDeleting(true);
      await deleteCategory(category._id);
      toast.success("Categoría eliminada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar la categoría");
    } finally {
      setIsDeleting(false);
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
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-red-500 text-white border-b-4 border-black">
                <div className="flex items-center gap-3">
                  <TrashIcon className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    Eliminar Categoría
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
                {/* Warning Icon and Message */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    className="p-4 bg-red-100 border-4 border-black rounded-none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", damping: 15 }}
                  >
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                  </motion.div>

                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-black uppercase tracking-wider text-black">
                      ¿Estás seguro?
                    </h3>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      Esta acción no se puede deshacer
                    </p>
                  </motion.div>

                  {/* Category Info */}
                  <motion.div
                    className="w-full p-4 bg-gray-50 border-4 border-black"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">{category.icon || "📁"}</span>
                      <div className="text-center">
                        <p className="font-black uppercase tracking-wider text-black">
                          {category.name}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase">
                          {category.isExpense ? "GASTO" : "INGRESO"}
                        </p>
                      </div>
                      <div
                        className="w-4 h-4 border-2 border-black"
                        style={{ backgroundColor: category.color || "#6B7280" }}
                      />
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    Se eliminarán todas las transacciones asociadas
                  </motion.p>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-4 pt-6 border-t-4 border-black mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    className="brutal-button flex-1 bg-white text-black border-black hover:bg-gray-100 font-black uppercase tracking-wider"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    className="brutal-button flex-1 bg-red-500 text-white border-red-500 hover:bg-red-600 font-black uppercase tracking-wider"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}