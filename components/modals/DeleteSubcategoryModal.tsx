"use client";

import { useState } from "react";
import { BrutalFormModal } from "@/components/ui/brutal-form-modal";
import { useCategories, Subcategory } from "@/hooks/use-categories";

interface DeleteSubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
}

export function DeleteSubcategoryModal({ isOpen, onClose, subcategory }: DeleteSubcategoryModalProps) {
  const { deleteSubcategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategory) {
      return;
    }

    setIsLoading(true);

    try {
      await deleteSubcategory(subcategory._id);
      onClose();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!subcategory) {
    return null;
  }

  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Subcategoría"
      subtitle="Esta acción no se puede deshacer. Todas las transacciones asociadas a esta subcategoría perderán su referencia."
      onSubmit={handleSubmit}
      submitText="ELIMINAR SUBCATEGORÍA"
      cancelText="CANCELAR"
      isLoading={isLoading}
      size="lg"
      variant="secondary"
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="p-4 border-4 border-red-500 bg-red-50">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-black text-lg text-red-800">
                ¡ATENCIÓN!
              </h3>
              <p className="text-sm font-bold text-red-700">
                Esta acción eliminará permanentemente la subcategoría.
              </p>
            </div>
          </div>
        </div>

        {/* Subcategory Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-black uppercase tracking-wider text-black">
            SUBCATEGORÍA A ELIMINAR
          </h4>
          <div className="p-4 border-4 border-black bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{subcategory.icon || "📄"}</span>
              <div>
                <p className="font-black text-lg">
                  {subcategory.name}
                </p>
                <p className="text-sm font-bold text-gray-600">
                  Subcategoría
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="p-4 border-4 border-gray-300 bg-gray-50">
          <p className="text-sm font-bold text-gray-700 text-center">
            Escribe &quot;ELIMINAR&quot; para confirmar que deseas eliminar esta subcategoría.
          </p>
        </div>
      </div>
    </BrutalFormModal>
  );
}