import { useEffect, useRef, useCallback } from 'react';

// Hook para monitorear performance de componentes
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        if (duration > 16) { // Solo log si tarda más de 1 frame (16ms)
          console.log(`[Performance] ${componentName}: ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName]);
}

// Hook para debounce de funciones
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

// Hook para throttle de funciones
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
}

// Utility para medir performance de funciones
export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// Hook para detectar renders innecesarios
export function useRenderTracker(componentName: string, props?: Record<string, unknown>) {
  const renderCountRef = useRef(0);
  const prevPropsRef = useRef(props);
  
  useEffect(() => {
    renderCountRef.current += 1;
    
    if (props && prevPropsRef.current) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== prevPropsRef.current?.[key]
      );
      
      if (changedProps.length > 0) {
        console.log(
          `[Render] ${componentName} #${renderCountRef.current} - Changed props:`,
          changedProps
        );
      } else {
        console.log(
          `[Render] ${componentName} #${renderCountRef.current} - No prop changes (unnecessary render?)`
        );
      }
    }
    
    prevPropsRef.current = props;
  });
}