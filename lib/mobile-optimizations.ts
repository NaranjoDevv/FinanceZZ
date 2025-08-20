import { useEffect, useState } from 'react';

// Hook para detectar dispositivos móviles
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check inicial
    checkIsMobile();

    // Listener para cambios de tamaño
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook para detectar orientación del dispositivo
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  return orientation;
}

// Clases CSS responsivas para modales
export const mobileModalClasses = {
  // Contenedor principal del modal
  container: 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4',
  
  // Modal base con responsividad
  modal: [
    'w-full bg-white border-4 border-black',
    'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    'max-h-[95vh] sm:max-h-[90vh] overflow-y-auto',
    // Tamaños responsivos
    'max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl'
  ].join(' '),
  
  // Header responsivo
  header: [
    'flex items-center justify-between',
    'p-3 sm:p-4 md:p-6',
    'border-b-4 border-black'
  ].join(' '),
  
  // Título responsivo
  title: [
    'text-lg sm:text-xl md:text-2xl',
    'font-black uppercase tracking-wider',
    'truncate pr-2'
  ].join(' '),
  
  // Contenido responsivo
  content: 'p-3 sm:p-4 md:p-6',
  
  // Botones responsivos
  buttonContainer: 'flex flex-col sm:flex-row gap-2 sm:gap-4 pt-3 sm:pt-4',
  
  // Input responsivo
  input: [
    'w-full px-3 py-2 sm:px-4 sm:py-3',
    'border-4 border-black',
    'text-sm sm:text-base',
    'min-h-[44px] sm:min-h-[48px]' // Tamaño mínimo para touch
  ].join(' '),
  
  // Label responsivo
  label: 'text-xs sm:text-sm font-bold text-black flex items-center gap-2',
  
  // Botón responsivo
  button: [
    'min-h-[44px] sm:min-h-[48px]', // Tamaño mínimo para touch
    'py-2 px-4 sm:py-3 sm:px-6',
    'text-sm sm:text-base font-bold',
    'border-4 border-black',
    'flex items-center justify-center gap-2'
  ].join(' ')
};

// Utilidades para espaciado responsivo
export const responsiveSpacing = {
  xs: 'space-y-1 sm:space-y-2',
  sm: 'space-y-2 sm:space-y-3',
  md: 'space-y-3 sm:space-y-4',
  lg: 'space-y-4 sm:space-y-6',
  xl: 'space-y-6 sm:space-y-8'
};

// Función para generar clases responsivas dinámicamente
export function generateResponsiveClasses({
  mobile,
  tablet,
  desktop
}: {
  mobile: string;
  tablet?: string;
  desktop?: string;
}) {
  const classes = [mobile];
  
  if (tablet) {
    classes.push(`sm:${tablet}`);
  }
  
  if (desktop) {
    classes.push(`lg:${desktop}`);
  }
  
  return classes.join(' ');
}

// Hook para manejar el scroll del body en modales móviles
export function useModalBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      // Prevenir zoom en iOS
      document.addEventListener('touchmove', preventDefault, { passive: false });
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventDefault);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [isOpen]);
}

function preventDefault(e: TouchEvent) {
  e.preventDefault();
}

// Configuración de breakpoints
export const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1280
} as const;

// Función para obtener el breakpoint actual
export function getCurrentBreakpoint() {
  if (typeof window === 'undefined') return 'mobile';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
}