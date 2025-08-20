'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerColor?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

const headerColorClasses = {
  red: 'bg-red-50 border-red-500',
  blue: 'bg-blue-50 border-blue-500',
  green: 'bg-green-50 border-green-500',
  yellow: 'bg-yellow-50 border-yellow-500',
  gray: 'bg-gray-50 border-gray-500'
};

const titleColorClasses = {
  red: 'text-red-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  gray: 'text-gray-600'
};

const decorativeColorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-500'
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  headerColor = 'gray',
  icon
}: BaseModalProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
              w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
              ${className}
            `}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b-4 border-black ${headerColorClasses[headerColor]}`}>
              <div className="flex items-center gap-3">
                {icon && (
                  <div className={titleColorClasses[headerColor]}>
                    {icon}
                  </div>
                )}
                <h2 className={`text-lg sm:text-xl font-black uppercase tracking-wide ${titleColorClasses[headerColor]}`}>
                  {title}
                </h2>
              </div>
              {showCloseButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 border-2 border-black hover:bg-gray-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Decorative line */}
            <motion.div
              className={`w-full h-1 ${decorativeColorClasses[headerColor]}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}