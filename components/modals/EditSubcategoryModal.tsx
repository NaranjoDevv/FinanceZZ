"use client";

import { useState, useEffect } from "react";
import { BrutalFormModal } from "@/components/ui/brutal-form-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories, Subcategory } from "@/hooks/use-categories";

interface EditSubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
}

const EMOJI_OPTIONS = [
  "📄", "📝", "📊", "💼", "🏠", "🚗", "🍔", "🎬", "🎮", "📱",
  "💡", "🔧", "🎯", "📚", "🎨", "🏥", "✈️", "🛒", "💳", "🎵",
  "🏃", "🍕", "☕", "🎪", "🎭", "🎲", "🎸", "📷", "🌟", "⚡"
];

export function EditSubcategoryModal({ isOpen, onClose, subcategory }: EditSubcategoryModalProps) {
  const { updateSubcategory } = useCategories();
  const [formData, setFormData] = useState({
    name: "",
    icon: "📄",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when subcategory changes
  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        icon: subcategory.icon || "📄",
      });
    }
  }, [subcategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !subcategory) {
      return;
    }

    setIsLoading(true);

    try {
      await updateSubcategory(subcategory._id, {
        name: formData.name.trim(),
        icon: formData.icon,
      });

      onClose();
    } catch (error) {
      console.error("Error updating subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        icon: subcategory.icon || "📄",
      });
    }
    onClose();
  };

  if (!subcategory) {
    return null;
  }

  return (
    <BrutalFormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Subcategoría"
      subtitle={`Modificar la subcategoría "${subcategory.name}"`}
      onSubmit={handleSubmit}
      submitText="GUARDAR CAMBIOS"
      cancelText="CANCELAR"
      isLoading={isLoading}
      size="md"
    >
      <div className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label className="text-sm font-black uppercase tracking-wider text-black">
            NOMBRE DE LA SUBCATEGORÍA
          </Label>
          <Input
            type="text"
            placeholder="INGRESA EL NOMBRE..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border-4 border-black font-black text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-gray-600 bg-white uppercase tracking-wide transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            required
            maxLength={50}
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-black uppercase tracking-wider text-black">
            ICONO
          </Label>
          <div className="grid grid-cols-10 gap-2 p-4 border-4 border-black bg-white">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, icon: emoji })}
                className={`w-10 h-10 text-xl flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 ${formData.icon === emoji
                    ? "border-black bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "border-gray-300 bg-white hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-black uppercase tracking-wider text-black">
            VISTA PREVIA
          </Label>
          <div className="p-4 border-4 border-black bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{formData.icon}</span>
              <div>
                <p className="font-black text-lg">
                  {formData.name || "Nombre de la subcategoría"}
                </p>
                <p className="text-sm font-bold text-gray-600">
                  Subcategoría
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrutalFormModal>
  );
}