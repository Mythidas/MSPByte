import { Database, Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { Operations } from '@/types';
import { PaginationOptions } from '@/types/data-table';

// types.ts
export type Table = keyof Database['public']['Tables'];
export type TableOrView = keyof Database['public']['Tables'] | keyof Database['public']['Views'];

export type RowFilter<T extends TableOrView> =
  | [column: keyof Tables<T>, operator: Operations, value: any]
  | undefined;
export type RowSort<T extends TableOrView> =
  | [column: keyof Tables<T>, order: 'asc' | 'desc']
  | undefined;

export type GetRowConfig<T extends TableOrView> = {
  filters?: Array<RowFilter<T> | undefined>;
  sorting?: Array<RowSort<T> | undefined>;
  pagination?: PaginationOptions;
};

export type GetRowCountConfig<T extends TableOrView> = {
  filters?: Array<RowFilter<T> | undefined>;
};

export type InsertRowConfig<T extends Table> = {
  rows: TablesInsert<T>[];
};

export type UpdateRowConfig<T extends Table> = {
  id: string;
  row: TablesUpdate<T>;
};

export type UpsertRowConfig<T extends Table> = {
  rows: TablesUpdate<T>[];
  filters?: Array<RowFilter<T> | undefined>;
};

export type DeleteRowConfig<T extends Table> = {
  filters: Array<RowFilter<T>>;
};
