import { Operations, Option } from '@/types';
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

export type FilterOperations = Operations | 'bt';
export type FilterType = 'text' | 'select' | 'boolean' | 'date' | 'number' | 'multiselect';

export type FilterPrimitive = string | number | boolean | string[] | undefined;
export type FilterPrimitiveTuple = [FilterPrimitive, FilterPrimitive];
export type FilterValue =
  | { op: Exclude<FilterOperations, 'bt'>; value: FilterPrimitive | undefined }
  | { op: 'bt'; value: FilterPrimitiveTuple };
export type Filters = Record<string, FilterValue>;

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

export type PaginationOptions = {
  page: number;
  size: number;
  filters?: Filters;
  globalFields?: string[];
  globalSearch?: string;
  filterMap?: Record<string, string>;
  sorting?: Record<string, 'asc' | 'desc'>;
};

export type DataResponse<T> = {
  rows: T[];
  total: number;
};
