import { Option } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { ClassValue } from 'clsx';

export type DataTableFetcher = {
  pageIndex: number;
  pageSize: number;
  sorting: Record<string, 'asc' | 'desc'>;
  filters: Filters;
  globalFields: string[];
  globalSearch: string;
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

export type FilterOperation =
  | 'eq' // equal
  | 'ne' // not equal
  | 'gt' // greater than
  | 'lt' // less than
  | 'bt' // between
  | 'in' // array includes
  | 'lk' // like / partial
  | 'nl' // not like
  | 'ct' // contains (e.g., JSON/text array)
  | 'nct' // does not contain
  | 'is'; // is null / is not null;
export type FilterType = 'text' | 'select' | 'boolean' | 'date' | 'number' | 'multiselect';

export type FilterPrimitive = string | number | boolean | string[] | undefined;
export type FilterPrimitiveTuple = [FilterPrimitive, FilterPrimitive];
export type FilterValue =
  | { op: Exclude<FilterOperation, 'bt'>; value: FilterPrimitive | undefined }
  | { op: 'bt'; value: FilterPrimitiveTuple };
export type Filters = Record<string, FilterValue>;

export type DataTableFilter = {
  type: FilterType;
  label?: string;
  options?: Option[];
  placeholder?: string;
  operations?: FilterOperation[];
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
