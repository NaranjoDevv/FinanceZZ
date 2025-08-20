"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface BrutalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  icon?: React.ReactNode;
  itemDetails?: React.ReactNode;
}

const variantConfig = {
  danger: {
    headerBg: "bg-red-500",
    iconBg: "bg-red-100",
    confirmBg: "bg-red-600 hover:bg-red-700",
    borderColor: "border-red-500"
  },
  warning: {
    headerBg: "bg-yellow-500",
    iconBg: "bg-yellow-100",
    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    borderColor: "border-yellow-500"
  },
  info: {
    headerBg: "bg-blue-500",
    iconBg: "bg-blue-100",
    confirmBg: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-blue-500"
  }
};

export function BrutalConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  icon,
  itemDetails
}: BrutalConfirmationModalProps) {
  const config = variantConfig[variant];
  const defaultIcon = variant === "danger" ? <TrashIcon className="w-6 h-6" /> : <ExclamationTriangleIcon className="w-6 h-6" />;
  const displayIcon = icon || defaultIcon;

  const handleConfirm = async () => {
    if (!isLoading) {
      await onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="brutal-card p-0 border-4 border-black shadow-brutal max-w-md w-full overflow-hidden"
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
              className="w-full"
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 sm:p-6 ${config.headerBg} text-white border-b-4 border-black`}>
                <div className="flex items-center gap-3">
                  {displayIcon}
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider">
                    {title}
                  </h2>
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
                className="w-full h-1 bg-black"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />

              {/* Content */}
              <motion.div
                className="p-4 sm:p-6 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {/* Warning Icon and Message */}
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
                  <motion.div
                    className={`p-3 sm:p-4 ${config.iconBg} border-4 border-black rounded-none`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", damping: 15 }}
                  >
                    <ExclamationTriangleIcon className="w-8 h-8 sm:w-12 sm:h-12 text-black" />
                  </motion.div>

                  <motion.div
                    className="space-y-3 sm:space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <p className="text-sm sm:text-base font-bold text-black leading-relaxed">
                      {description}
                    </p>

                    {/* Item Details */}
                    {itemDetails && (
                      <motion.div
                        className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border-2 border-black space-y-2 sm:space-y-3 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                      >
                        {itemDetails}
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
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
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`brutal-button flex-1 order-1 sm:order-2 h-10 sm:h-12 text-sm sm:text-base font-black uppercase tracking-wider text-white ${config.confirmBg} border-black`}
                  >
                    {isLoading ? "PROCESANDO..." : confirmText}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}