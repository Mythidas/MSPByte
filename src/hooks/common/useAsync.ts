'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type UseAsyncOptions<T> = {
  fetcher: () => Promise<T>;
  initial: T;
  deps?: unknown[];
  immediate?: boolean;
};

export function useAsync<T>({ fetcher, initial, deps = [], immediate = true }: UseAsyncOptions<T>) {
  const [data, setData] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const run = useCallback(async () => {
    hasFetched.current = true;
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

  return { data, isLoading, error, refetch: run, hasFetched: hasFetched.current };
}
