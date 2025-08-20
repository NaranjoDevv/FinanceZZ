import { useQuery } from 'convex/react';
import { useMemo, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseOptimizedQueryOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useOptimizedQuery<T>(
  query: any,
  args: any,
  options: UseOptimizedQueryOptions = {}
) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;
  
  const result = useQuery(query, enabled ? args : "skip");
  const cacheRef = useRef<CacheEntry<T> | null>(null);

  return useMemo(() => {
    if (!result) return { data: undefined, isLoading: true, error: null };

    // Cache simple en memoria
    if (cacheRef.current) {
      const { data: cachedData, timestamp } = cacheRef.current;
      if (Date.now() - timestamp < staleTime) {
        return { data: cachedData, isLoading: false, error: null };
      }
    }

    cacheRef.current = { data: result, timestamp: Date.now() };
    return { data: result, isLoading: false, error: null };
  }, [result, staleTime]);
}

// Hook para optimizar múltiples queries
export function useOptimizedQueries<T extends Record<string, any>>(
  queries: T,
  options: UseOptimizedQueryOptions = {}
) {
  const results = useMemo(() => {
    const queryResults: Record<string, any> = {};
    
    Object.entries(queries).forEach(([key, { query, args }]) => {
      queryResults[key] = useOptimizedQuery(query, args, options);
    });
    
    return queryResults;
  }, [queries, options]);

  const isLoading = Object.values(results).some((result: any) => result.isLoading);
  const hasError = Object.values(results).some((result: any) => result.error);

  return {
    ...results,
    isLoading,
    hasError
  };
}