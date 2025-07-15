import { useEffect, useState, useRef, useCallback } from 'react';

export type LazyLoadOptions<T> = {
  loader: () => Promise<T> | T;
  render: (data: T) => React.ReactNode;
  skeleton: () => React.ReactNode;
  error?: () => React.ReactNode;
  deps?: unknown[];
  lazy?: boolean;
  enabled?: boolean;
  refetchInterval?: number; // <-- new
};

export function useLazyLoad<T>({
  loader,
  render,
  skeleton,
  error,
  deps = [],
  lazy = false,
  enabled = true,
  refetchInterval,
}: LazyLoadOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isError, setIsError] = useState<unknown>(null);
  const triggered = useRef(lazy);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setIsError(null);

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      console.error('Lazy load failed:', err);
      setIsError(err);
    }
  }, [enabled, loader]);

  // Auto-trigger on mount if lazy = false
  useEffect(() => {
    if (!lazy && enabled && !triggered.current) {
      triggered.current = true;
      load();
    }
  }, [lazy, enabled, load]);

  // Re-trigger on deps
  useEffect(() => {
    if (!triggered.current) return;
    load();
  }, [...deps]);

  // Polling
  useEffect(() => {
    if (!enabled || !refetchInterval || !triggered.current) return;

    intervalRef.current = setInterval(() => {
      load();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, refetchInterval, load]);

  const trigger = () => {
    if (!triggered.current) {
      triggered.current = true;
      load();
    }
  };

  if (isError)
    return { content: error ? error() : <div>Error loading data.</div>, trigger } as const;
  if (data) return { content: render(data), trigger } as const;
  return { content: skeleton(), trigger } as const;
}
