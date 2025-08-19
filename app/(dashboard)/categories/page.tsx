"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "@heroicons/react/24/outline";
import { useCategories, Category } from "@/hooks/use-categories";
import { NewCategoryModal } from "@/components/modals/NewCategoryModal";
import { EditCategoryModal } from "@/components/modals/EditCategoryModal";
import { DeleteCategoryModal } from "@/components/modals/DeleteCategoryModal";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const {
    categories,
    isLoading,
    isAuthenticated,
  } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
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
            onClick={() => setIsNewCategoryModalOpen(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Categoría
          </Button>
          <Button className="brutal-button">
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
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 text-white rounded-none">
                  <TagIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Totales
              </h3>
              <p className="text-2xl font-black text-blue-600 transition-colors duration-200">{totalCategories}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-500 text-white rounded-none">
                  <TagIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Gastos
              </h3>
              <p className="text-2xl font-black text-red-600 transition-colors duration-200">{totalExpenseCategories}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 text-white rounded-none">
                  <TagIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-1 transition-colors duration-200">
                Categorías Ingresos
              </h3>
              <p className="text-2xl font-black text-green-600 transition-colors duration-200">{totalIncomeCategories}</p>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <Card className="brutal-card p-6">
          <h3 className="text-lg font-black uppercase tracking-wide mb-4 text-black transition-colors duration-200">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-2 block transition-colors duration-200">
                Buscar categorías
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="brutal-input w-full pl-12"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-2 block transition-colors duration-200">
                Tipo
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="brutal-select">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
      <Card className="brutal-card p-6">
        <h3 className="text-lg font-black uppercase tracking-wide mb-6 text-black transition-colors duration-200">
          Categorías ({filteredCategories.length})
        </h3>
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-black uppercase tracking-wide mb-2">No hay categorías</h3>
            <p className="text-gray-600 font-medium mb-4">
              {searchTerm || selectedType !== "all"
                ? "No se encontraron categorías con los filtros aplicados"
                : "Comienza creando tu primera categoría"}
            </p>
            {!searchTerm && selectedType === "all" && (
              <Button 
                className="brutal-button brutal-button--primary"
                onClick={() => setIsNewCategoryModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group brutal-card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{category.icon || "📁"}</div>
                    <div>
                      <h4 className="font-black text-lg">{category.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge
                          className={`font-bold uppercase text-xs ${
                            category.isExpense
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {category.isExpense ? "Gasto" : "Ingreso"}
                        </Badge>
                        {category.isSystem && (
                          <Badge className="bg-gray-500 text-white font-bold uppercase text-xs">
                            Sistema
                          </Badge>
                        )}
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 border-2 border-black"
                            style={{ backgroundColor: category.color || "#6B7280" }}
                          />
                          <span className="text-sm font-bold text-gray-600 transition-colors duration-200">
                            {category.subcategories?.length || 0} subcategorías
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      className="brutal-button brutal-button--small"
                      onClick={() => handleEditCategory(category)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    {!category.isSystem && (
                      <Button
                        className="brutal-button brutal-button--small brutal-button--danger"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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

      <DeleteCategoryModal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => {
          setIsDeleteCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
}