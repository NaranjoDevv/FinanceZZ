import React, { lazy, ComponentType, Suspense, ReactNode, useState, useEffect, useRef } from 'react';

// Crear componente lazy con fallback personalizable
export function createLazyComponent(
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: Record<string, unknown>) {
    return React.createElement(
      Suspense,
      { 
        fallback: fallback || React.createElement('div', {
          className: 'h-32 w-full animate-pulse bg-gray-100 rounded'
        })
      },
      React.createElement(LazyComponent, props)
    );
  };
}

// Fallback brutalista para componentes lazy
export const BrutalistFallback = ({ height = "h-32" }: { height?: string }) => {
  return React.createElement('div', {
    className: `${height} w-full border-4 border-black bg-white flex items-center justify-center`
  }, React.createElement('div', {
    className: 'border-2 border-black px-4 py-2 bg-gray-100 font-bold text-sm uppercase'
  }, 'Cargando...'));
};

// Fallback para modales
export const ModalFallback = () => {
  return React.createElement('div', {
    className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
  }, React.createElement('div', {
    className: 'bg-white border-4 border-black shadow-[8px_8px_0px_black] w-full max-w-md p-6'
  }, React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('div', { key: '1', className: 'h-6 bg-gray-200 border-2 border-black animate-pulse' }),
    React.createElement('div', { key: '2', className: 'h-4 bg-gray-100 border border-black animate-pulse' }),
    React.createElement('div', { key: '3', className: 'h-4 bg-gray-100 border border-black animate-pulse w-3/4' }),
    React.createElement('div', { key: '4', className: 'flex gap-2 mt-6' }, [
      React.createElement('div', { key: '4a', className: 'h-10 bg-gray-200 border-2 border-black animate-pulse flex-1' }),
      React.createElement('div', { key: '4b', className: 'h-10 bg-gray-200 border-2 border-black animate-pulse flex-1' })
    ])
  ])));
};

// Precargar imagen
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Precargar componente
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
): Promise<ComponentType<Record<string, unknown>>> {
  return importFn().then(module => module.default);
}

// Hook para lazy loading con intersection observer
export function useLazyLoad(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, hasLoaded]);

  return { ref, isVisible, hasLoaded };
}