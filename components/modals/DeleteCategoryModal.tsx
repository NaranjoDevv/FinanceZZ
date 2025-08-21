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
    <div className="space-y-4 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-black" />
          <span className="font-black text-black text-sm uppercase tracking-wider">NOMBRE:</span>
        </div>
        <span className="font-black text-black text-lg">{category.name}</span>
      </div>
      
      {category.description && (
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-black" />
            <span className="font-black text-black text-sm uppercase tracking-wider">DESCRIPCIÓN:</span>
          </div>
          <span className="font-black text-black text-sm max-w-[200px] truncate">
            {category.description}
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          {!category.isExpense ? (
            <ArrowTrendingUpIcon className="w-5 h-5 text-black" />
          ) : (
            <ArrowTrendingDownIcon className="w-5 h-5 text-black" />
          )}
          <span className="font-black text-black text-sm uppercase tracking-wider">TIPO:</span>
        </div>
        <span className="font-black text-black text-lg uppercase">
          {!category.isExpense ? "INGRESO" : "GASTO"}
        </span>
      </div>
    </div>
  );

  return (
    <BrutalConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="ELIMINAR CATEGORÍA"
      description="¿ESTÁS SEGURO DE QUE QUIERES ELIMINAR ESTA CATEGORÍA? ESTA ACCIÓN NO SE PUEDE DESHACER."
      confirmText="ELIMINAR"
      cancelText="CANCELAR"
      variant="danger"
      isLoading={isDeleting}
      itemDetails={itemDetails}
    />
  );
}