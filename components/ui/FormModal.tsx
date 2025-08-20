'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { Button } from './button';
import { motion } from 'framer-motion';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showActions?: boolean;
  submitButtonVariant?: 'default' | 'success' | 'danger';
  formId?: string;
  className?: string;
  headerColor?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  icon?: React.ReactNode;
}

const submitVariants = {
  default: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  success: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600'
};

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isLoading = false,
  size = 'md',
  showActions = true,
  submitButtonVariant = 'default',
  formId,
  className = '',
  headerColor = 'blue',
  icon
}: FormModalProps) {
  const defaultIcon = <DocumentPlusIcon className="w-6 h-6" />;
  const displayIcon = icon || defaultIcon;
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
      className={className}
      headerColor={headerColor}
      icon={displayIcon}
    >
      <div className="flex flex-col h-full">
        {/* Form Content */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Actions */}
        {showActions && (
          <motion.div 
            className="border-t-4 border-black bg-gray-50 p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
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
                type={formId ? 'submit' : 'button'}
                form={formId}
                onClick={formId ? undefined : handleSubmit}
                disabled={isLoading}
                className={`brutal-button flex-1 order-1 sm:order-2 h-10 sm:h-12 text-sm sm:text-base font-black uppercase tracking-wider ${submitVariants[submitButtonVariant]}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div 
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </BaseModal>
  );
}

// Hook para manejar formularios en modales
export function useFormModal() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = async (
    onSubmit: () => Promise<void> | void,
    onSuccess?: () => void,
    onError?: (error: unknown) => void
  ) => {
    try {
      setIsLoading(true);
      setErrors({});
      await onSubmit();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      if (onError) {
        onError(error);
      } else {
        setErrors({ general: error instanceof Error ? error.message : 'Ha ocurrido un error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setFieldError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    isLoading,
    errors,
    handleSubmit,
    setFieldError,
    clearErrors
  };
}