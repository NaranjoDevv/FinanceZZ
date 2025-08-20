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

const CATEGORY_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#C026D3", "#E11D48", "#DC2626", "#7C2D12",
  "#365314", "#064E3B", "#164E63", "#1E3A8A", "#312E81", "#581C87"
];

export function NewCategoryModal({ isOpen, onClose }: NewCategoryModalProps) {
  const { createCategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<'preset' | 'custom'>('preset');
  const [formData, setFormData] = useState({
    name: "",
    icon: "📁",
    color: "#6B7280",
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
        color: formData.color,
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
        color: "#6B7280",
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
                  <Label htmlFor="icon" className="block text-sm font-medium text-black mb-2">
                    Ícono
                  </Label>
                  <div className="grid grid-cols-10 gap-2 p-4 border-4 border-black bg-white max-h-32 overflow-y-auto">
                    {CATEGORY_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`text-lg border-2 transition-all hover:scale-110 ${formData.icon === icon
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white hover:border-black"
                          }`}
                        onClick={() => setFormData({ ...formData, icon })}
                        disabled={isLoading}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="color" className="block text-sm font-medium text-black mb-2">
                    Color
                  </Label>

                  {/* Color Mode Selector */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setColorPickerMode('preset')}
                      className={`px-4 py-2 border-2 font-medium transition-all ${colorPickerMode === 'preset'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                        }`}
                      disabled={isLoading}
                    >
                      Colores Predefinidos
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorPickerMode('custom')}
                      className={`px-4 py-2 border-2 font-medium transition-all ${colorPickerMode === 'custom'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                        }`}
                      disabled={isLoading}
                    >
                      Selector de Color
                    </button>
                  </div>

                  {/* Preset Colors */}
                  {colorPickerMode === 'preset' && (
                    <div className="grid grid-cols-12 gap-2 p-4 border-4 border-black bg-white">
                      {CATEGORY_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 border-4 transition-all hover:scale-110 ${formData.color === color ? "border-black scale-110" : "border-gray-300"
                            }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  )}

                  {/* Custom Color Picker */}
                  {colorPickerMode === 'custom' && (
                    <div className="p-4 border-4 border-black bg-white">
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-16 h-16 border-4 border-black cursor-pointer"
                          disabled={isLoading}
                        />
                        <div className="flex-1">
                          <Label htmlFor="hex-input" className="block text-sm font-medium text-black mb-2">
                            Código Hexadecimal
                          </Label>
                          <input
                            id="hex-input"
                            type="text"
                            value={formData.color}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                                setFormData({ ...formData, color: value });
                              }
                            }}
                            className="w-full px-3 py-2 border-4 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-black transition-all"
                            placeholder="#000000"
                            disabled={isLoading}
                            maxLength={7}
                          />
                        </div>
                        <div
                          className="w-12 h-12 border-4 border-black"
                          style={{ backgroundColor: formData.color }}
                        />
                      </div>
                    </div>
                  )}
                </div>

    </BrutalFormModal>
  );
}