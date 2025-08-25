"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { useCategories, Category } from "@/hooks/use-categories";
import { useBilling } from "@/hooks/useBilling";
import { NewCategoryModal } from "@/components/modals/NewCategoryModal";
import { EditCategoryModal } from "@/components/modals/EditCategoryModal";
import { DeleteCategoryModal } from "@/components/modals/DeleteCategoryModal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Componente para categoría en vista de cuadrícula
function GridCategory({ category, handleEditCategory, handleDeleteCategory, router }: {
  category: Category;
  handleEditCategory: (category: Category) => void;
  handleDeleteCategory: (category: Category) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative p-4 border-2 border-gray-200 hover:border-black transition-all duration-200 group"
    >
      {/* Header with icon and type */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{category.icon || "📁"}</div>
        <div className="flex items-center space-x-1">
          <Badge
            className={`font-bold uppercase text-xs border-2 ${
              category.isExpense
                ? "bg-red-500 text-white border-red-500"
                : "bg-green-500 text-white border-green-500"
            }`}
          >
            {category.isExpense ? "GASTO" : "INGRESO"}
          </Badge>
          {category.isSystem && (
            <Badge className="bg-gray-800 text-white font-bold uppercase text-xs border-2 border-black">
              SYS
            </Badge>
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className="font-bold text-sm uppercase tracking-wide mb-2 leading-tight">
        {category.name}
      </h4>

      {/* Subcategories count */}
      <div className="text-xs text-gray-600 mb-3">
        <span className="font-medium">{category.subcategories?.length || 0} subcategorías</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/categories/${category._id}/subcategories`)}
          className="flex-1 p-2 bg-purple-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-purple-500 hover:bg-white hover:text-purple-500 transition-all duration-200"
          title="Ver subcategorías"
        >
          <svg className="h-3 w-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleEditCategory(category)}
          className="flex-1 p-2 bg-blue-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-blue-500 hover:bg-white hover:text-blue-500 transition-all duration-200"
        >
          <PencilIcon className="w-3 h-3 mx-auto" />
        </motion.button>
        {!category.isSystem && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteCategory(category)}
            className="flex-1 p-2 bg-red-500 text-white text-xs font-bold uppercase tracking-wide border-2 border-red-500 hover:bg-white hover:text-red-500 transition-all duration-200"
          >
            <TrashIcon className="w-3 h-3 mx-auto" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default function Categories() {
  const router = useRouter();
  const {
    categories,
    isLoading,
    isAuthenticated,
  } = useCategories();
  const { billingInfo, isFree, getUsagePercentage, canPerformAction } = useBilling();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  if (isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="mb-8 pt-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="px-6 py-0">
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium text-lg">
            Debes iniciar sesión para ver las categorías
          </p>
        </div>
      </div>
    );
  }

  // Filter categories based on search and type
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" ||
      (selectedType === "expense" && category.isExpense) ||
      (selectedType === "income" && !category.isExpense);

    return matchesSearch && matchesType;
  });

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.isSystem) {
      toast.error("No puedes eliminar categorías del sistema");
      return;
    }

    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  // Handle new category with limit check
  const handleNewCategory = async () => {
    const canProceed = await canPerformAction("categories");
    if (canProceed) {
      setIsNewCategoryModalOpen(true);
    }
    // If can't proceed, canPerformAction already shows the subscription popup
  };

  const totalCategories = categories.length;
  const totalExpenseCategories = categories.filter(cat => cat.isExpense === true).length;
  const totalIncomeCategories = categories.filter(cat => cat.isExpense === false).length;

  return (
    <div className="px-6 py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 pt-6"
      >
        <h1 className="text-4xl font-black uppercase tracking-wider mb-2 text-black transition-colors duration-200">
          Categorías
        </h1>
        <p className="text-gray-600 font-medium transition-colors duration-200">
          Gestiona las categorías de tus transacciones
        </p>
        <div className="w-20 h-1 bg-black mt-4"></div>
      </motion.div>

      {/* Usage Indicator for Free Users */}
      {isFree && billingInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="brutal-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Categorías personalizadas</span>
              <span className="text-sm font-bold text-gray-600">
                {billingInfo.usage.categories}/{billingInfo.limits.categories}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  getUsagePercentage('categories') >= 80 
                    ? 'bg-red-500' 
                    : getUsagePercentage('categories') >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(getUsagePercentage('categories'), 100)}%`,
                }}
              />
            </div>
            {getUsagePercentage('categories') >= 80 && (
              <p className="text-xs text-red-600 font-bold mt-2">
                ⚠  Te estás acercando al límite
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-4">
          <Button
            className="brutal-button brutal-button--primary"
            onClick={handleNewCategory}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Categoría
          </Button>
          <Button 
            className={`brutal-button ${showFilters ? 'bg-black text-white' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 text-white rounded-none">
                  <TagIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Totales
              </h3>
              <p className="text-sm sm:text-2xl font-black text-blue-600 transition-colors duration-200">{totalCategories}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-500 text-white rounded-none">
                  <TagIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Gastos
              </h3>
              <p className="text-sm sm:text-2xl font-black text-red-600 transition-colors duration-200">{totalExpenseCategories}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
          >
            <Card className="brutal-card p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-green-500 text-white rounded-none">
                  <TagIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Ingresos
              </h3>
              <p className="text-sm sm:text-2xl font-black text-green-600 transition-colors duration-200">{totalIncomeCategories}</p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
             initial={{ opacity: 0, y: -20, height: 0 }}
             animate={{ opacity: 1, y: 0, height: "auto" }}
             exit={{ opacity: 0, y: -20, height: 0 }}
             transition={{ 
               duration: 0.4,
               ease: "easeInOut",
               height: { delay: 0.1, duration: 0.3 }
             }}
             className="mb-6 sm:mb-8"
           >
            <Card className="brutal-card p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar categorías..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600 text-sm sm:text-base"
                    />
                  </div>

                  {/* Type Filter */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 text-sm sm:text-base">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        <SelectItem value="expense">Gastos</SelectItem>
                        <SelectItem value="income">Ingresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wide">
                Lista de Categorías ({filteredCategories.length})
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`p-2 border-2 transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 border-2 transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {categories.length === 0
                    ? "No tienes categorías aún"
                    : "No se encontraron categorías con los filtros aplicados"
                  }
                </p>
                {categories.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    Crea tu primera categoría para organizar tus transacciones
                  </p>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.0 }}
                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 border-gray-200 hover:border-black transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-3xl flex-shrink-0">{category.icon || "📁"}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm md:text-base uppercase tracking-wide truncate leading-tight">
                          {category.name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs md:text-sm text-gray-600 mt-0.5">
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={`font-bold uppercase text-xs border-2 ${
                                category.isExpense
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-green-500 text-white border-green-500"
                              }`}
                            >
                              {category.isExpense ? "GASTO" : "INGRESO"}
                            </Badge>
                            {category.isSystem && (
                              <Badge className="bg-gray-800 text-white font-bold uppercase text-xs border-2 border-black">
                                SISTEMA
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs md:text-sm">{category.subcategories?.length || 0} subcategorías</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 md:gap-2 transition-all duration-200 opacity-0 group-hover:opacity-100 mt-2 sm:mt-0">
                      <motion.button
                        onClick={() => router.push(`/categories/${category._id}/subcategories`)}
                        className="brutal-button p-1.5 md:p-2 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Ver subcategorías"
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditCategory(category)}
                        className="brutal-button p-1.5 md:p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Editar categoría"
                      >
                        <PencilIcon className="w-3 h-3 md:w-4 md:h-4" />
                      </motion.button>
                      {!category.isSystem && (
                        <motion.button
                          onClick={() => handleDeleteCategory(category)}
                          className="brutal-button p-1.5 md:p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Eliminar categoría"
                        >
                          <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <GridCategory
                    key={category._id}
                    category={category}
                    handleEditCategory={handleEditCategory}
                    handleDeleteCategory={handleDeleteCategory}
                    router={router}
                  />
                ))}
              </div>
            )}
        </div>
      </Card>
      </motion.div>

      {/* Modals */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
      />

      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      {selectedCategory && (
        <DeleteCategoryModal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => {
            setIsDeleteCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />
      )}
    </div>
  );
}