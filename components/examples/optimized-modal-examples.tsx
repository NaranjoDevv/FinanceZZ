'use client';

/**
 * EJEMPLOS DE USO DE LOS WRAPPERS OPTIMIZADOS
 * 
 * Este archivo muestra cómo integrar los nuevos wrappers de performance
 * con los modales existentes sin modificar su código original.
 */

import { useState } from 'react';
import { OptimizedModalWrapper, OptimizedFormModal, useOptimizedModal } from '@/components/common/optimized-modal-wrapper';
import { LazyWrapper } from '@/components/common/performance-wrapper';

// Ejemplo 1: Wrapper básico para cualquier modal existente
export function ExampleBasicWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal Optimizado
      </button>
      
      <OptimizedModalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        name="example-modal"
        size="md"
        enablePerformanceMonitoring={true}
      >
        {/* Aquí va el contenido de cualquier modal existente */}
        <div className="p-6">
          <h2 className="text-2xl font-black mb-4">Modal Optimizado</h2>
          <p>Este modal tiene todas las optimizaciones aplicadas automáticamente.</p>
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 px-4 py-2 bg-black text-white font-black"
          >
            Cerrar
          </button>
        </div>
      </OptimizedModalWrapper>
    </>
  );
}

// Ejemplo 2: Usando el hook personalizado
export function ExampleWithHook() {
  const [isOpen, setIsOpen] = useState(false);
  const { OptimizedWrapper } = useOptimizedModal('contact-modal');
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Modal con Hook
      </button>
      
      <OptimizedWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="lg"
      >
        {/* Contenido del modal CreateContactModal original */}
        <div className="p-6">
          <h2 className="text-2xl font-black mb-4">Crear Contacto</h2>
          {/* Aquí iría el formulario original */}
        </div>
      </OptimizedWrapper>
    </>
  );
}

// Ejemplo 3: Modal de formulario optimizado
export function ExampleFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Modal de Formulario
      </button>
      
      <OptimizedFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        name="form-modal"
        title="Nuevo Elemento"
        size="md"
      >
        {/* Formulario original sin modificaciones */}
        <form className="space-y-4">
          <input 
            type="text" 
            placeholder="Nombre"
            className="w-full p-3 border-4 border-black font-black"
          />
          <input 
            type="email" 
            placeholder="Email"
            className="w-full p-3 border-4 border-black font-black"
          />
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 p-3 border-4 border-black font-black hover:bg-black hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 p-3 bg-black text-white font-black hover:bg-gray-800 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </OptimizedFormModal>
    </>
  );
}

// Ejemplo 4: Modal con lazy loading
export function ExampleLazyModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Modal con Lazy Loading
      </button>
      
      <LazyWrapper
        name="lazy-modal"
        className="lazy-modal-wrapper"
      >
        <OptimizedModalWrapper
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          name="lazy-modal"
        >
          <div className="p-6">
            <h2 className="text-2xl font-black mb-4">Modal con Lazy Loading</h2>
            <p>Este modal solo se carga cuando es necesario.</p>
          </div>
        </OptimizedModalWrapper>
      </LazyWrapper>
    </>
  );
}

// Ejemplo 5: Cómo migrar un modal existente (CreateContactModal)
export function MigratedCreateContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <OptimizedFormModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      name="create-contact"
      title="Crear Nuevo Contacto"
      size="md"
      enablePerformanceMonitoring={process.env.NODE_ENV === 'development'}
    >
      {/* 
        Aquí se copia exactamente el contenido del modal original
        desde CreateContactModal.tsx, pero sin el wrapper exterior
        y sin el manejo de isOpen/onClose
      */}
      <form className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-black text-gray-700">
            Nombre *
          </label>
          <input
            type="text"
            className="w-full p-3 border-4 border-black font-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
            placeholder="Nombre completo"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-black text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="w-full p-3 border-4 border-black font-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
            placeholder="email@ejemplo.com"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 p-3 border-4 border-black font-black hover:bg-black hover:text-white transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 p-3 bg-black text-white font-black hover:bg-gray-800 transition-colors duration-200"
          >
            Crear Contacto
          </button>
        </div>
      </form>
    </OptimizedFormModal>
  );
}

/**
 * INSTRUCCIONES DE MIGRACIÓN:
 * 
 * 1. Para migrar un modal existente:
 *    - Copia el contenido interno del modal (sin el wrapper exterior)
 *    - Envuélvelo con OptimizedModalWrapper o OptimizedFormModal
 *    - Mantén toda la lógica de estado y funciones originales
 * 
 * 2. Para modales de formulario:
 *    - Usa OptimizedFormModal que incluye header y botón de cierre
 *    - Solo necesitas pasar el contenido del formulario
 * 
 * 3. Para modales complejos:
 *    - Usa OptimizedModalWrapper para control total
 *    - Mantén la estructura original del modal
 * 
 * 4. Para modales pesados:
 *    - Combina con LazyWrapper para lazy loading
 *    - Mejora el tiempo de carga inicial
 */