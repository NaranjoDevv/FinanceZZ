"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface BrutalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "create" | "edit" | "primary" | "secondary";
  icon?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showFooter?: boolean;
  customFooter?: ReactNode;
}

const variantConfig = {
  create: {
    headerBg: "bg-black",
    submitBg: "bg-black hover:bg-gray-800",
    borderColor: "border-black"
  },
  edit: {
    headerBg: "bg-black",
    submitBg: "bg-black hover:bg-gray-800",
    borderColor: "border-black"
  },
  primary: {
    headerBg: "bg-black",
    submitBg: "bg-black hover:bg-gray-800",
    borderColor: "border-black"
  },
  secondary: {
    headerBg: "bg-gray-800",
    submitBg: "bg-gray-800 hover:bg-gray-700",
    borderColor: "border-gray-800"
  }
};

const sizeConfig = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};

export function BrutalFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = "Guardar",
  cancelText = "Cancelar",
  isLoading = false,
  variant = "primary",
  icon,
  size = "md",
  showFooter = true,
  customFooter
}: BrutalFormModalProps) {
  const config = variantConfig[variant];
  const sizeClass = sizeConfig[size];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`brutal-card p-0 border-4 border-black shadow-brutal ${sizeClass} w-full max-h-[90vh] overflow-hidden`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full flex flex-col"
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 sm:p-6 ${config.headerBg} text-white border-b-4 border-black flex-shrink-0`}>
                <div className="flex items-center gap-3">
                  {icon && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    >
                      {icon}
                    </motion.div>
                  )}
                  <div>
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider">
                      {title}
                    </h2>
                    {subtitle && (
                      <p className="text-sm opacity-90 font-medium mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="brutal-button p-2 bg-white text-black hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Decorative line */}
              <motion.div
                className="w-full h-1 bg-black flex-shrink-0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Form Content */}
              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <motion.div
                    className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </div>

                {/* Footer */}
                {showFooter && (
                  <motion.div
                    className="border-t-4 border-black bg-gray-50 p-4 sm:p-6 flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    {customFooter || (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={isLoading}
                          className="brutal-button flex-1 order-2 sm:order-1 h-10 sm:h-12 text-sm sm:text-base font-black uppercase tracking-wider"
                        >
                          {cancelText}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className={`brutal-button flex-1 order-1 sm:order-2 h-10 sm:h-12 text-sm sm:text-base font-black uppercase tracking-wider text-white ${config.submitBg} border-black`}
                        >
                          {isLoading ? "GUARDANDO..." : submitText}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Hook para manejar el estado común de formularios
export function useFormModal<T extends Record<string, unknown>>(initialState: T = {} as T) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openModal = (data?: Partial<T>) => {
    setFormData({ ...initialState, ...data });
    setErrors({});
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsLoading(false);
    setFormData(initialState);
    setErrors({});
  };

  const updateField = (field: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    isOpen,
    isLoading,
    formData,
    errors,
    openModal,
    closeModal,
    updateField,
    setFieldError,
    clearErrors,
    setIsLoading
  };
}