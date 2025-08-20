// hooks/brutal-hooks.ts
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// ============================================
// useModalState - Elimina useState repetitivo
// ============================================
export function useModalState(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return { isOpen, open, close, toggle };
}

// ============================================
// useResponsive - Detecta breakpoints sin re-renders
// ============================================
export function useResponsive() {
    const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setBreakpoint('mobile');
            } else if (width < 1024) {
                setBreakpoint('tablet');
            } else {
                setBreakpoint('desktop');
            }
        };

        // Check inicial
        checkBreakpoint();

        // Debounce para performance
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkBreakpoint, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return useMemo(() => ({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop'
    }), [breakpoint]);
}

// ============================================
// useDebounce - Optimiza inputs y búsquedas
// ============================================
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ============================================
// useLocalStorage - Persistencia optimizada
// ============================================
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Estado inicial con lazy loading
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Setter memoizado
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue] as const;
}

// ============================================
// useIntersectionObserver - Lazy loading optimizado
// ============================================
export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry) {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting) {
                    setHasIntersected(true);
                }
            }
        }, options);

        const element = ref.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [ref, options]);

    return { isIntersecting, hasIntersected };
}

// ============================================
// useKeyPress - Detección de teclas optimizada
// ============================================
export function useKeyPress(targetKey: string, handler: () => void) {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [targetKey, handler]);
}

// ============================================
// useClickOutside - Detecta clicks fuera del elemento
// ============================================
export function useClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: () => void
) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, handler]);
}

// ============================================
// usePrevious - Valor anterior de una prop
// ============================================
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// ============================================
// useAsync - Manejo de promesas optimizado
// ============================================
interface AsyncState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    immediate = true
) {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        error: null,
        loading: false
    });

    const execute = useCallback(async () => {
        setState({ data: null, error: null, loading: true });

        try {
            const data = await asyncFunction();
            setState({ data, error: null, loading: false });
            return data;
        } catch (error) {
            setState({ data: null, error: error as Error, loading: false });
            throw error;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { ...state, execute };
}