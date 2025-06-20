import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

export function useTableURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [initialFilters, setInitialFilters] = useState<ColumnFiltersState>([]);
  const [initialSorting, setInitialSorting] = useState<SortingState>([]);

  useEffect(() => {
    const filters: ColumnFiltersState = [];
    const sorting: SortingState = [];

    searchParams.forEach((value, key) => {
      if (key === 'sort') {
        const [id, dir] = value.split(':');
        sorting.push({ id, desc: dir === 'desc' });
      } else if (key !== 'tab') {
        filters.push({ id: key, value });
      }
    });

    setInitialFilters(filters);
    setInitialSorting(sorting);
  }, [searchParams]);

  const applyUrlState = ({
    filters,
    sorting,
  }: {
    filters?: ColumnFiltersState;
    sorting?: SortingState;
  }) => {
    const params = new URLSearchParams({ tab: searchParams.get('tab') || '' });
    filters?.forEach(({ id, value }) => {
      if (value != null && value !== '') {
        params.set(id, String(value));
      }
    });

    if (sorting && sorting.length > 0) {
      const s = sorting[0];
      params.set('sort', `${s.id}:${s.desc ? 'desc' : 'asc'}`);
    }

    router.replace(`?${params.toString()}`);
  };

  return {
    initialFilters,
    initialSorting,
    applyUrlState,
    isReady: initialFilters.length > 0 || searchParams.toString() === '', // useful guard
  };
}
