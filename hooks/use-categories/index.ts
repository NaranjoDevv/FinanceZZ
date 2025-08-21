import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useMemo } from "react";

export interface Category {
  _id: Id<"categories">;
  userId?: Id<"users">;
  name: string;
  color?: string;
  icon?: string;
  isExpense: boolean;
  isSystem: boolean;
  order: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  _id: Id<"subcategories">;
  categoryId: Id<"categories">;
  name: string;
  icon?: string;
  order: number;
}

export function useCategories() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Memoize query arguments to prevent unnecessary re-queries
  const queryArgs = useMemo(() => {
    return currentUser?._id ? { userId: currentUser._id } : "skip";
  }, [currentUser?._id]);

  const expenseQueryArgs = useMemo(() => {
    return currentUser?._id ? { userId: currentUser._id, isExpense: true } : "skip";
  }, [currentUser?._id]);

  const incomeQueryArgs = useMemo(() => {
    return currentUser?._id ? { userId: currentUser._id, isExpense: false } : "skip";
  }, [currentUser?._id]);
  
  // Queries
  const categories = useQuery(api.categories.getUserCategories, queryArgs);
  const expenseCategories = useQuery(api.categories.getUserCategories, expenseQueryArgs);
  const incomeCategories = useQuery(api.categories.getUserCategories, incomeQueryArgs);
  
  // Mutations
  const createCategoryMutation = useMutation(api.categories.createCategory);
  const updateCategoryMutation = useMutation(api.categories.updateCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
  
  const createSubcategoryMutation = useMutation(api.categories.createSubcategory);
  const updateSubcategoryMutation = useMutation(api.categories.updateSubcategory);
  const deleteSubcategoryMutation = useMutation(api.categories.deleteSubcategory);
  
  // Helper functions
  const createCategory = async (data: {
    name: string;
    color?: string;
    icon?: string;
    isExpense: boolean;
  }) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para crear categorías");
      return;
    }
    
    try {
      const nextOrder = (categories?.length || 0) + 1;
      
      await createCategoryMutation({
        userId: currentUser._id,
        name: data.name,
        color: data.color || "#6B7280",
        icon: data.icon || "📁",
        isExpense: data.isExpense,
        order: nextOrder,
      });
      
      toast.success("Categoría creada exitosamente");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error al crear la categoría");
    }
  };
  
  const updateCategory = async (id: Id<"categories">, data: {
    name?: string;
    color?: string;
    icon?: string;
    isExpense?: boolean;
  }) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para actualizar categorías");
      return;
    }
    
    try {
      await updateCategoryMutation({
        id,
        userId: currentUser._id,
        ...data,
      });
      
      toast.success("Categoría actualizada exitosamente");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error al actualizar la categoría");
    }
  };
  
  const deleteCategory = async (id: Id<"categories">) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para eliminar categorías");
      return;
    }
    
    try {
      await deleteCategoryMutation({
        id,
        userId: currentUser._id,
      });
      
      toast.success("Categoría eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error al eliminar la categoría");
    }
  };
  
  const createSubcategory = async (data: {
    categoryId: Id<"categories">;
    name: string;
    icon?: string;
  }) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para crear subcategorías");
      return;
    }
    
    try {
      const category = categories?.find(c => c._id === data.categoryId);
      const nextOrder = (category?.subcategories?.length || 0) + 1;
      
      await createSubcategoryMutation({
        categoryId: data.categoryId,
        userId: currentUser._id,
        name: data.name,
        icon: data.icon || "📄",
        order: nextOrder,
      });
      
      toast.success("Subcategoría creada exitosamente");
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Error al crear la subcategoría");
    }
  };
  
  const updateSubcategory = async (id: Id<"subcategories">, data: {
    name?: string;
    icon?: string;
  }) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para actualizar subcategorías");
      return;
    }
    
    try {
      await updateSubcategoryMutation({
        id,
        userId: currentUser._id,
        ...data,
      });
      
      toast.success("Subcategoría actualizada exitosamente");
    } catch (error) {
      console.error("Error updating subcategory:", error);
      toast.error("Error al actualizar la subcategoría");
    }
  };
  
  const deleteSubcategory = async (id: Id<"subcategories">) => {
    if (!currentUser?._id) {
      toast.error("Debes iniciar sesión para eliminar subcategorías");
      return;
    }
    
    try {
      await deleteSubcategoryMutation({
        id,
        userId: currentUser._id,
      });
      
      toast.success("Subcategoría eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      toast.error("Error al eliminar la subcategoría");
    }
  };
  
  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Data
    categories: categories || [],
    expenseCategories: expenseCategories || [],
    incomeCategories: incomeCategories || [],
    isLoading: categories === undefined,
    currentUser,
    isAuthenticated: !!user && !!currentUser,
    
    // Actions
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  }), [
    categories,
    expenseCategories,
    incomeCategories,
    currentUser,
    user,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  ]);
}