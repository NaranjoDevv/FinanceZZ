"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { BrutalConfirmationModal } from "@/components/ui/brutal-confirmation-modal";
import {
  TagIcon,
  DocumentTextIcon,
  SwatchIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Id } from "@/convex/_generated/dataModel";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    _id: Id<"categories">;
    name: string;
    description?: string;
    color?: string;
    isExpense: boolean;
  };
}

export function DeleteCategoryModal({ isOpen, onClose, category }: DeleteCategoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
  const currentUser = useQuery(api.users.getCurrentUser);

  const handleDelete = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteCategoryMutation({ 
        id: category._id,
        userId: currentUser._id 
      });
      toast.success("Categoría eliminada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar la categoría");
    } finally {
      setIsDeleting(false);
    }
  };

  const itemDetails = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Nombre:</span>
        </div>
        <span className="font-bold text-black text-sm">{category.name}</span>
      </div>
      
      {category.description && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-600 text-sm">Descripción:</span>
          </div>
          <span className="font-bold text-black text-sm max-w-[200px] truncate">
            {category.description}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!category.isExpense ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-600 text-sm">Tipo:</span>
        </div>
        <span className="font-bold text-black text-sm capitalize">
          {!category.isExpense ? "Ingreso" : "Gasto"}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SwatchIcon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-600 text-sm">Color:</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border-2 border-black"
            style={{ backgroundColor: category.color || '#6B7280' }}
          />
          <span className="font-bold text-black text-sm">
            {category.color || '#6B7280'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <BrutalConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Eliminar Categoría"
      description="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="danger"
      isLoading={isDeleting}
      itemDetails={itemDetails}
    />
  );
}