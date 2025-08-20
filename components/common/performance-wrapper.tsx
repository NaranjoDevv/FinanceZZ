import { memo, forwardRef, ReactNode } from 'react';
import { usePerformanceMonitor } from '@/lib/performance';

interface PerformanceWrapperProps {
  children: ReactNode;
  name: string;
  className?: string;
  enableMonitoring?: boolean;
}

export const PerformanceWrapper = memo(forwardRef<HTMLDivElement, PerformanceWrapperProps>(
  ({ children, name, className, enableMonitoring = process.env.NODE_ENV === 'development' }, ref) => {
    // Solo monitorear en desarrollo para evitar overhead en producción
    const renderTime = usePerformanceMonitor(name);
    
    if (enableMonitoring && renderTime) {
      console.log(`[Performance] ${name}: ${renderTime}ms`);
    }
    
    return (
      <div ref={ref} className={className} data-performance-name={name}>
        {children}
      </div>
    );
  }
));

PerformanceWrapper.displayName = 'PerformanceWrapper';

// Wrapper específico para modales con optimizaciones adicionales
interface ModalWrapperProps {
  children: ReactNode;
  isOpen: boolean;
  name: string;
  className?: string;
}

export const ModalWrapper = memo<ModalWrapperProps>(({ 
  children, 
  isOpen, 
  name, 
  className 
}) => {
  // Solo renderizar cuando esté abierto para performance
  if (!isOpen) return null;

  return (
    <PerformanceWrapper name={`Modal-${name}`} className={className || ''}>
      {children}
    </PerformanceWrapper>
  );
});

ModalWrapper.displayName = 'ModalWrapper';

// Wrapper para componentes que requieren lazy loading
interface LazyWrapperProps {
  children: ReactNode;
  name: string;
  className?: string;
}

export const LazyWrapper = memo<LazyWrapperProps>(({ 
  children, 
  name, 
  className 
}) => {
  return (
    <PerformanceWrapper name={`Lazy-${name}`} className={className || ''}>
      <div className="lazy-content">
        {children}
      </div>
    </PerformanceWrapper>
  );
});

LazyWrapper.displayName = 'LazyWrapper';