'use client';

import { memo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './error-boundary';
import { PerformanceWrapper } from './performance-wrapper';
import { 
  brutalModalVariants, 
  overlayVariants, 
  optimizedTransitions,
  useReducedMotion,
  getMotionConfig
} from '@/lib/motion-optimizations';
import { 
  mobileModalClasses, 
  useModalBodyScroll, 
  useIsMobile 
} from '@/lib/mobile-optimizations';
import { cn } from '@/lib/utils';

interface OptimizedModalWrapperProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  enablePerformanceMonitoring?: boolean;
  disableAnimation?: boolean;
}

export const OptimizedModalWrapper = memo<OptimizedModalWrapperProps>(({ 
  children, 
  isOpen, 
  onClose, 
  name,
  className,
  size = 'md',
  enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
  disableAnimation = false
}) => {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const shouldAnimate = !disableAnimation && !reducedMotion;
  
  // Manejar scroll del body en móviles
  useModalBodyScroll(isOpen);
  
  // Configuración de motion según preferencias
  const modalMotionConfig = shouldAnimate 
    ? getMotionConfig(brutalModalVariants, false)
    : getMotionConfig(brutalModalVariants, true);
    
  const overlayMotionConfig = shouldAnimate
    ? getMotionConfig(overlayVariants, false)
    : getMotionConfig(overlayVariants, true);

  // Clases de tamaño responsivas
  const sizeClasses = {
    sm: 'max-w-full sm:max-w-sm md:max-w-md',
    md: 'max-w-full sm:max-w-md md:max-w-lg',
    lg: 'max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl',
    xl: 'max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl'
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Error in modal ${name}:`, error, errorInfo);
      }}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <PerformanceWrapper 
            name={`OptimizedModal-${name}`} 
            enableMonitoring={enablePerformanceMonitoring}
            className="fixed inset-0 z-50"
          >
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
              {...overlayMotionConfig}
            />
            
            {/* Modal Container */}
            <div className={cn(
              mobileModalClasses.container,
              isMobile && 'p-2'
            )}>
              <motion.div
                className={cn(
                  mobileModalClasses.modal,
                  sizeClasses[size],
                  className
                )}
                {...modalMotionConfig}
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </motion.div>
            </div>
          </PerformanceWrapper>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
});

OptimizedModalWrapper.displayName = 'OptimizedModalWrapper';

// Hook para usar el wrapper optimizado fácilmente
export function useOptimizedModal(name: string) {
  return {
    OptimizedWrapper: ({ children, isOpen, onClose, ...props }: Omit<OptimizedModalWrapperProps, 'name'>) => (
      <OptimizedModalWrapper
        name={name}
        isOpen={isOpen}
        onClose={onClose}
        {...props}
      >
        {children}
      </OptimizedModalWrapper>
    )
  };
}

// Componente específico para modales de formularios
interface OptimizedFormModalProps extends OptimizedModalWrapperProps {
  title: string;
  showCloseButton?: boolean;
}

export const OptimizedFormModal = memo<OptimizedFormModalProps>(({ 
  children,
  title,
  showCloseButton = true,
  ...wrapperProps
}) => {
  return (
    <OptimizedModalWrapper {...wrapperProps}>
      <div className={mobileModalClasses.header}>
        <h2 className={mobileModalClasses.title}>
          {title}
        </h2>
        {showCloseButton && (
          <motion.button
            onClick={wrapperProps.onClose}
            className="text-xl sm:text-2xl font-black hover:bg-black hover:text-white px-2 py-1 transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={optimizedTransitions.fast}
          >
            ×
          </motion.button>
        )}
      </div>
      
      <div className={mobileModalClasses.content}>
        {children}
      </div>
    </OptimizedModalWrapper>
  );
});

OptimizedFormModal.displayName = 'OptimizedFormModal';