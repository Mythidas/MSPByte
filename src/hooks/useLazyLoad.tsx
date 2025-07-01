import { useEffect, useState, useRef, useCallback } from 'react';

type LazyLoadOptions<T> = {
  loader: () => Promise<T> | T;
  render: (data: T) => React.ReactNode;
  skeleton: () => React.ReactNode;
  error?: () => React.ReactNode;
  deps?: unknown[];
  lazy?: boolean;
  enabled?: boolean;
};

export function useLazyLoad<T>({
  loader,
  render,
  skeleton,
  error,
  deps = [],
  lazy = false,
  enabled = true,
}: LazyLoadOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isError, setIsError] = useState<unknown>(null);
  const triggered = useRef(lazy); // pre-trigger if lazy = false

  const load = useCallback(async () => {
    if (!enabled || triggered.current) return;

    triggered.current = true;
    setIsError(null);

    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      console.error('Lazy load failed:', err);
      setIsError(err);
    } finally {
    }
  }, [enabled, loader]);

  // Auto-trigger on mount if lazy = false
  useEffect(() => {
    if (!lazy && enabled && !triggered.current) {
      load();
    }
  }, [lazy, enabled, load]);

  // Re-trigger on deps change
  useEffect(() => {
    if (!triggered.current) return;
    triggered.current = false;
    load();
  }, [...deps]);

  const trigger = () => {
    if (!triggered.current) {
      load();
    }
  };

  if (isError)
    return { content: error ? error() : <div>Error loading data.</div>, trigger } as const;
  if (data) return { content: render(data), trigger } as const;
  return { content: skeleton(), trigger } as const;
}
