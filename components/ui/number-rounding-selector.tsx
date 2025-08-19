"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface NumberRoundingSelectorProps {
  currentRounding: boolean;
  onRoundingChange?: (rounding: boolean) => void;
}

export function NumberRoundingSelector({ 
  currentRounding, 
  onRoundingChange 
}: NumberRoundingSelectorProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const updateUserNumberRounding = useMutation(api.users.updateUserNumberRounding);

  const handleRoundingChange = async (newRounding: boolean) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await updateUserNumberRounding({ numberRounding: newRounding });
      onRoundingChange?.(newRounding);
      toast.success(
        newRounding 
          ? "¡Redondeo activado! Los números se mostrarán como 1M, 1K" 
          : "Redondeo desactivado. Se mostrarán números completos"
      );
    } catch (error) {
      console.error("Error updating number rounding:", error);
      toast.error("Error al actualizar la configuración de redondeo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Formato de Números
        </label>
        <p className="text-xs text-gray-600 font-medium">
          Elige cómo mostrar los números grandes en tu dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Opción: Números Completos */}
        <motion.button
          onClick={() => handleRoundingChange(false)}
          disabled={isLoading}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200
            ${!currentRounding 
              ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            font-bold text-sm uppercase tracking-wide
          `}
          whileHover={{ scale: !currentRounding ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="space-y-2">
            <div className="text-left">
              <div className="font-black text-base">Completos</div>
              <div className="text-xs opacity-80">$1,234,567</div>
            </div>
          </div>
          
          {!currentRounding && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
        </motion.button>

        {/* Opción: Números Redondeados */}
        <motion.button
          onClick={() => handleRoundingChange(true)}
          disabled={isLoading}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200
            ${currentRounding 
              ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            font-bold text-sm uppercase tracking-wide
          `}
          whileHover={{ scale: currentRounding ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="space-y-2">
            <div className="text-left">
              <div className="font-black text-base">Redondeados</div>
              <div className="text-xs opacity-80">$1.2M</div>
            </div>
          </div>
          
          {currentRounding && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
        </motion.button>
      </div>
      
      {/* Información adicional */}
      <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800 font-medium">
            <strong>Tip:</strong> Con números redondeados, pasa el cursor sobre cualquier balance para ver el valor completo.
          </div>
        </div>
      </div>
    </div>
  );
}