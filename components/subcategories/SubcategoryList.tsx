"use client";

import { useState, useMemo, memo } from "react";
import { Category, Subcategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { NewSubcategoryModal } from "@/components/modals/NewSubcategoryModal";
import { EditSubcategoryModal } from "@/components/modals/EditSubcategoryModal";
import { DeleteSubcategoryModal } from "@/components/modals/DeleteSubcategoryModal";

interface SubcategoryListProps {
  category: Category;
  subcategories: Subcategory[];
}

export const SubcategoryList = memo(function SubcategoryList({ category, subcategories }: SubcategoryListProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState<Subcategory | null>(null);

  // Memoize subcategories count to avoid recalculation
  const subcategoriesCount = useMemo(() => subcategories.length, [subcategories.length]);

  // Memoize subcategories grid to avoid re-rendering when props haven't changed
  const subcategoriesGrid = useMemo(() => {
    if (subcategoriesCount === 0) return null;
    
    return subcategories.map((subcategory) => (
      <div
        key={subcategory._id}
        className="p-4 border-4 border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-xl">{subcategory.icon || "📄"}</span>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-wide">
                {subcategory.name}
              </h4>
              <p className="text-xs font-bold text-gray-600">
                Subcategoría
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setEditingSubcategory(subcategory)}
              className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Editar subcategoría"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingSubcategory(subcategory)}
              className="p-2 border-2 border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]"
              title="Eliminar subcategoría"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ));
  }, [subcategories, subcategoriesCount, setEditingSubcategory, setDeletingSubcategory]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-black text-lg">{category.name}</h3>
            <p className="text-sm font-bold text-gray-600">
              {subcategoriesCount} subcategoría{subcategoriesCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-black text-white border-4 border-black font-black px-4 py-2 hover:bg-white hover:text-black transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
        >
          + NUEVA SUBCATEGORÍA
        </Button>
      </div>

      {/* Subcategories Grid */}
      {subcategoriesCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategoriesGrid}
        </div>
      ) : (
        <div className="p-8 border-4 border-gray-300 bg-gray-50 text-center">
          <div className="space-y-4">
            <span className="text-6xl">📂</span>
            <div>
              <h3 className="font-black text-lg text-gray-700">
                NO HAY SUBCATEGORÍAS
              </h3>
              <p className="text-sm font-bold text-gray-600">
                Crea la primera subcategoría para organizar mejor tus transacciones.
              </p>
            </div>
            <Button
              onClick={() => setShowNewModal(true)}
              className="bg-black text-white border-4 border-black font-black px-6 py-2 hover:bg-white hover:text-black transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
            >
              CREAR PRIMERA SUBCATEGORÍA
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewSubcategoryModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        category={category}
      />

      <EditSubcategoryModal
        isOpen={!!editingSubcategory}
        onClose={() => setEditingSubcategory(null)}
        subcategory={editingSubcategory}
      />

      <DeleteSubcategoryModal
        isOpen={!!deletingSubcategory}
        onClose={() => setDeletingSubcategory(null)}
        subcategory={deletingSubcategory}
      />
    </div>
  );
});