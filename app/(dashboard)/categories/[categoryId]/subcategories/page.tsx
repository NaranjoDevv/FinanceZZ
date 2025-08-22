"use client";

import { useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { SubcategoryList } from "@/components/subcategories/SubcategoryList";
import { ArrowLeftIcon, TagIcon } from "@heroicons/react/24/outline";
import { Id } from "@/convex/_generated/dataModel";

export default function SubcategoriesPage() {
  const params = useParams();
  const router = useRouter();
  const { categories, isLoading } = useCategories();

  const categoryId = params.categoryId as Id<"categories">;

  // Memoize category and subcategories to avoid unnecessary re-renders
  const { category, categorySubcategories } = useMemo(() => {
    if (!categories || !categoryId) {
      return { category: null, categorySubcategories: [] };
    }
    
    const foundCategory = categories.find(cat => cat._id === categoryId);
    return {
      category: foundCategory || null,
      categorySubcategories: foundCategory?.subcategories || []
    };
  }, [categories, categoryId]);

  // Memoize navigation handler to prevent re-creation on every render
  const handleGoBack = useCallback(() => {
    router.push('/categories');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="brutal-card p-8 text-center">
            <div className="space-y-4">
              <span className="text-6xl">❌</span>
              <div>
                <h1 className="font-black text-2xl text-gray-700">
                  CATEGORÍA NO ENCONTRADA
                </h1>
                <p className="text-sm font-bold text-gray-600 mt-2">
                  La categoría que buscas no existe o ha sido eliminada.
                </p>
              </div>
              <Button
                onClick={handleGoBack}
                className="bg-black text-white border-4 border-black font-black px-6 py-2 hover:bg-white hover:text-black transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
              >
                VOLVER A CATEGORÍAS
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/categories')}
              className="bg-gray-100 text-black border-4 border-black font-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              VOLVER
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-black text-white">
                <TagIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-wider text-black">
                  SUBCATEGORÍAS
                </h1>
                <p className="text-sm font-bold text-gray-600">
                  Gestiona las subcategorías de {category.name}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="brutal-card p-6 border-4 border-black bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{category.icon || "📁"}</span>
                <div>
                  <h2 className="font-black text-2xl">{category.name}</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-3 py-1 border-2 border-black font-black text-xs uppercase ${
                      category.isExpense 
                        ? "bg-red-500 text-white" 
                        : "bg-green-500 text-white"
                    }`}>
                      {category.isExpense ? "GASTO" : "INGRESO"}
                    </span>
                    {category.isSystem && (
                      <span className="px-3 py-1 border-2 border-black bg-gray-800 text-white font-black text-xs uppercase">
                        SISTEMA
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-black">
                  {categorySubcategories.length}
                </p>
                <p className="text-sm font-bold text-gray-600 uppercase">
                  Subcategorías
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subcategories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="brutal-card p-6">
            <SubcategoryList 
              category={category} 
              subcategories={categorySubcategories}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}