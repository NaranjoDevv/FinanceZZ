import { Variants, Transition } from 'framer-motion';

// Configuraciones de transición optimizadas
export const optimizedTransitions = {
  // Transición rápida para interacciones
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut'
  } as Transition,
  
  // Transición normal para la mayoría de casos
  normal: {
    type: 'tween',
    duration: 0.25,
    ease: 'easeInOut'
  } as Transition,
  
  // Transición suave para elementos grandes
  smooth: {
    type: 'tween',
    duration: 0.35,
    ease: [0.25, 0.46, 0.45, 0.94]
  } as Transition,
  
  // Transición con rebote para elementos importantes
  bounce: {
    type: 'spring',
    damping: 15,
    stiffness: 300,
    mass: 0.8
  } as Transition,
  
  // Transición elástica para feedback
  elastic: {
    type: 'spring',
    damping: 12,
    stiffness: 200,
    mass: 1
  } as Transition
};

// Variantes para modales brutalistas
export const brutalModalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: optimizedTransitions.fast
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: optimizedTransitions.bounce
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: optimizedTransitions.fast
  }
};

// Variantes para overlay de modales
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: optimizedTransitions.fast
  },
  visible: {
    opacity: 1,
    transition: optimizedTransitions.normal
  },
  exit: {
    opacity: 0,
    transition: optimizedTransitions.fast
  }
};

// Variantes para botones brutalistas
export const brutalButtonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    x: 0,
    y: 0
  },
  hover: {
    scale: 1.02,
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
    transition: optimizedTransitions.fast
  },
  tap: {
    scale: 0.98,
    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
    x: 2,
    y: 2,
    transition: optimizedTransitions.fast
  }
};

// Variantes para inputs brutalistas
export const brutalInputVariants: Variants = {
  idle: {
    borderColor: '#000000',
    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
  },
  focus: {
    borderColor: '#000000',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    transition: optimizedTransitions.fast
  },
  error: {
    borderColor: '#ef4444',
    boxShadow: '4px 4px 0px 0px rgba(239,68,68,1)',
    transition: optimizedTransitions.fast
  }
};

// Variantes para cards brutalistas
export const brutalCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: optimizedTransitions.smooth
  },
  hover: {
    y: -4,
    boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
    transition: optimizedTransitions.fast
  }
};

// Variantes para listas con stagger
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: optimizedTransitions.smooth
  }
};

// Variantes para notificaciones/toasts
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: optimizedTransitions.bounce
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    transition: optimizedTransitions.fast
  }
};

// Variantes para loading/skeleton
export const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Configuración para reducir motion en dispositivos que lo prefieren
export const respectsReducedMotion = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
  transition: { duration: 0 }
};

// Hook para detectar preferencia de reduced motion
export function useReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Función para aplicar configuración según reduced motion
export function getMotionConfig(variants: Variants, reducedMotion: boolean) {
  if (reducedMotion) {
    return respectsReducedMotion;
  }
  
  return {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants
  };
}

// Configuraciones específicas para diferentes tipos de componentes
export const componentMotionConfigs = {
  modal: {
    variants: brutalModalVariants,
    transition: optimizedTransitions.bounce
  },
  button: {
    variants: brutalButtonVariants,
    whileHover: 'hover',
    whileTap: 'tap'
  },
  card: {
    variants: brutalCardVariants,
    whileHover: 'hover'
  },
  input: {
    variants: brutalInputVariants
  },
  list: {
    container: staggerContainerVariants,
    item: staggerItemVariants
  }
};