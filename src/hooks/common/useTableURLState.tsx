import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { FilterValue } from '@/types/data-table';

function parseODataFilter(filterStr: string): ColumnFiltersState {
  const filters: ColumnFiltersState = [];

  // Split on ' and ', naive parser — improve if needed
  const parts = filterStr.split(/\s+and\s+/i);

  for (const part of parts) {
    const match = part.match(/^(\w+)\s+(eq|lk|ne|gt|lt|ge|le)\s+(.+)$/i);
    if (!match) continue;

    const [, field, op, rawValue] = match;
    const cleanValue = rawValue.replace(/^'|'$/g, ''); // strip quotes if string
    const parsedValue = isNaN(Number(cleanValue))
      ? cleanValue === 'true'
        ? true
        : cleanValue === 'false'
          ? false
          : cleanValue
      : Number(cleanValue);

    filters.push({
      id: field,
      value: { op, value: parsedValue },
    });
  }

  return filters;
}

function encodeODataFilter(filters: ColumnFiltersState): string {
  return filters
    .map(({ id, value: raw }) => {
      const value = raw as FilterValue;

      const encodedVal =
        typeof value.value === 'string' ? `${value.value.replace(/'/g, '')}` : String(value.value);
      return `${id} ${value.op} ${encodedVal}`;
    })
    .join(' and ');
}

export function useTableURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [initialFilters, setInitialFilters] = useState<ColumnFiltersState>([]);
  const [initialSorting, setInitialSorting] = useState<SortingState>([]);

  useEffect(() => {
    const filtersParam = searchParams.get('filter');
    const filters = filtersParam ? parseODataFilter(filtersParam) : [];

    const sortingParam = searchParams.get('orderby');
    const sorting: SortingState = [];

    if (sortingParam) {
      const [id, direction] = sortingParam.split(' ');
      sorting.push({ id, desc: direction.toLowerCase() === 'desc' });
    }

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
    const params = new URLSearchParams();
    const tab = searchParams.get('tab');
    if (tab) params.set('tab', tab);

    if (filters && filters.length > 0) {
      params.set('filter', encodeODataFilter(filters));
    }

    if (sorting && sorting.length > 0) {
      const s = sorting[0];
      params.set('orderby', `${s.id} ${s.desc ? 'desc' : 'asc'}`);
    }

    router.replace(`?${params.toString()}`);
  };

  return {
    initialFilters,
    initialSorting,
    applyUrlState,
    isReady: initialFilters.length > 0 || searchParams.toString() === '',
  };
}
