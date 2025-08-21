"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";

import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import { TagIcon } from "@heroicons/react/24/outline";
import { BrutalFormModal } from "@/components/ui/brutal-form-modal";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalSelect } from "@/components/ui/brutal-select";

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS = [
  "🏠", "🚗", "🍔", "🛒", "💊", "🎓", "🎮", "👕", "✈️", "🎬",
  "📱", "💻", "⚡", "🌐", "🏥", "🚌", "⛽", "🍕", "☕", "🎵",
  "📚", "🏋️", "💄", "🔧", "🎁", "💰", "💼", "📊", "🏆", "💎"
];

// Removed CATEGORY_COLORS for brutalist design - using only black, white, and gray

export function NewCategoryModal({ isOpen, onClose }: NewCategoryModalProps) {
  const { createCategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "📁",
    color: "#000000", // Fixed to black for brutalist design
    isExpense: true,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    setIsLoading(true);

    try {
      await createCategory({
        name: formData.name.trim(),
        icon: formData.icon,
        color: "#000000", // Always black for brutalist design
        isExpense: formData.isExpense,
      });

      toast.success("Categoría creada exitosamente");
      handleClose();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error al crear la categoría");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        icon: "📁",
        color: "#000000",
        isExpense: true,
      });
      onClose();
    }
  };

  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Nueva Categoría"
      subtitle="Crea una nueva categoría para organizar tus transacciones"
      submitText="Crear Categoría"
      cancelText="Cancelar"
      isLoading={isLoading}
      variant="create"
      icon={<TagIcon className="h-5 w-5" />}
      size="lg"
    >
      <BrutalInput
        label="Nombre *"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="Ej: Alimentación, Transporte, Salario..."
        disabled={isLoading}
        required
      />

      <BrutalSelect
        label="Tipo *"
        value={formData.isExpense ? "expense" : "income"}
        onChange={(value) => setFormData({ ...formData, isExpense: value === "expense" })}
        placeholder="Selecciona el tipo"
        disabled={isLoading}
        options={[
          { value: "expense", label: "💸 Gasto" },
          { value: "income", label: "💰 Ingreso" }
        ]}
      />

      <div>
        <Label htmlFor="icon" className="block text-sm font-black text-black mb-3 uppercase tracking-wide">
          ÍCONO
        </Label>
        <div className="grid grid-cols-10 gap-2 p-2  border-black bg-white max-h-32 overflow-y-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {CATEGORY_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`text-lg border-2 transition-all hover:scale-110 ${formData.icon === icon
                ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "border-gray-400 bg-white hover:border-black hover:bg-gray-100"
                }`}
              onClick={() => setFormData({ ...formData, icon })}
              disabled={isLoading}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

    </BrutalFormModal>
  );
}