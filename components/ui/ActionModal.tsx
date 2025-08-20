'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { Button } from './button';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantConfig = {
  danger: {
    headerColor: 'red' as const,
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-500',
    iconColor: 'text-red-600'
  },
  warning: {
    headerColor: 'yellow' as const,
    iconBg: 'bg-yellow-50',
    iconBorder: 'border-yellow-500',
    iconColor: 'text-yellow-600'
  },
  success: {
    headerColor: 'green' as const,
    iconBg: 'bg-green-50',
    iconBorder: 'border-green-500',
    iconColor: 'text-green-600'
  },
  info: {
    headerColor: 'blue' as const,
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-500',
    iconColor: 'text-blue-600'
  }
};

const defaultIcons = {
  danger: <ExclamationTriangleIcon className="w-12 h-12" />,
  warning: <ExclamationTriangleIcon className="w-12 h-12" />,
  success: <CheckCircleIcon className="w-12 h-12" />,
  info: <InformationCircleIcon className="w-12 h-12" />
};

export function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon,
  children
}: ActionModalProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || defaultIcons[variant];
  const headerIcon = variant === 'danger' ? defaultIcons[variant] : displayIcon;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      closeOnOverlayClick={!isLoading}
      headerColor={config.headerColor}
      icon={headerIcon}
    >
      <div className="p-6">
        {/* Warning Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
        >
          <div className={`brutal-card border-4 ${config.iconBorder} ${config.iconBg} p-4`}>
            <div className={config.iconColor}>
              {displayIcon}
            </div>
          </div>
        </motion.div>

        {/* Warning Message */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <h3 className="text-lg font-black uppercase tracking-wider mb-2">
            ¿Estás seguro?
          </h3>
          <p className="text-gray-600 font-medium">
            {description}
          </p>
        </motion.div>

        {/* Additional Content */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="brutal-button flex-1 order-2 sm:order-1 font-black uppercase tracking-wider"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="brutal-button flex-1 order-1 sm:order-2 font-black uppercase tracking-wider"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Procesando...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </motion.div>
      </div>
    </BaseModal>
  );
}