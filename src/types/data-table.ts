import { Option } from '@/types';
import { Filters, FilterType, FilterOperations } from '@/types/db';
import { ColumnDef } from '@tanstack/react-table';
import { ClassValue } from 'clsx';

export type DataTableFetcher = {
  pageIndex: number;
  pageSize: number;
  sorting: Record<string, 'asc' | 'desc'>;
  filters: Filters;
  globalFields: string[];
  globalSearch: string;
  initial: boolean;
};

export type DataTableColumnDef<TData> = {
  accessorKey?: string;
  simpleSearch?: boolean;
  headerClass?: ClassValue;
  cellClass?: ClassValue;
  meta?: {
    label?: string;
  };
} & ColumnDef<TData, undefined>;

export type DataTableFilter = {
  type: FilterType;
  label?: string;
  options?: Option[];
  placeholder?: string;
  operations?: FilterOperations[];
  simpleSearch?: boolean;
  serverKey?: string; // e.g. "metadata->>'valid_license'"
  dependsOn?: string[];
};
