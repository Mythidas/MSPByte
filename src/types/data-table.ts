import { Option } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { ClassValue } from 'clsx';

export type FilterOperation = 'eq' | 'ne' | 'gt' | 'lt' | 'bt' | 'in';
export type FilterType = 'text' | 'select' | 'boolean' | 'date' | 'number' | 'multiselect';

export type ColumnFilterMeta = {
  type: FilterType;
  options?: Option[];
  placeholder?: string;
  operations?: FilterOperation[];
};

export type DataTableColumnDef<TData> = {
  accessorKey?: string;
  simpleSearch?: boolean;
  filter?: ColumnFilterMeta;
  headerClass?: ClassValue;
  cellClass?: ClassValue;
  meta?: {
    label?: string;
  };
} & ColumnDef<TData, undefined>;

export type FilterPrimitive = string | number | boolean | string[];
export type FilterPrimitiveTuple = [FilterPrimitive, FilterPrimitive];
export type FilterValue =
  | { op: Exclude<FilterOperation, 'bt'>; value: FilterPrimitive | undefined }
  | { op: 'bt'; value: FilterPrimitiveTuple };
