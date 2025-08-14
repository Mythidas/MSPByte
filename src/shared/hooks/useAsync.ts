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
  const isMounted = useRef(true);
  const fetchId = useRef(0); // for race condition protection

  const run = useCallback(async () => {
    const currentFetchId = ++fetchId.current;
    hasFetched.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();

      // Cancel if a newer fetch started or component unmounted
      if (!isMounted.current || fetchId.current !== currentFetchId) return;

      setData(result);
    } catch (err) {
      if (!isMounted.current || fetchId.current !== currentFetchId) return;

      if (err instanceof Error) setError(err);
    } finally {
      if (!isMounted.current || fetchId.current !== currentFetchId) return;

      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) run();
  }, [run]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(String(error));
    }
  }, [error]);

  return {
    data,
    isLoading,
    error,
    refetch: run,
    hasFetched: hasFetched.current,
  };
}
