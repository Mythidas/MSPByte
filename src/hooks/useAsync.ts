'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type UseAsyncOptions<T> = {
  fetcher: () => Promise<T>;
  deps?: unknown[];
  immediate?: boolean;
};

export function useAsync<T>({ fetcher, deps = [], immediate = true }: UseAsyncOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      if (err instanceof Error) setError(err);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) run();
  }, [run]);

  useEffect(() => {
    if (error) {
      toast.error(String(error));
    }
  }, [error]);

  return { data, isLoading, error, refetch: run };
}
