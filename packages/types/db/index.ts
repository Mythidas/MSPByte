import { Database, Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { Operations } from '@/types';
import { PaginationOptions } from '@/types/data-table';

// types.ts
export type Table = keyof Database['public']['Tables'];
export type TableOrView = keyof Database['public']['Tables'] | keyof Database['public']['Views'];

export type RowFilter<T extends TableOrView> = [
  column: keyof Tables<T>,
  operator: Operations,
  value: any,
];

export type GetRowConfig<T extends TableOrView> = {
  filters?: RowFilter<T>[];
  pagination?: PaginationOptions;
};

export type InsertRowConfig<T extends Table> = {
  rows: TablesInsert<T>[];
  filters?: RowFilter<T>[];
};

export type UpdateRowConfig<T extends Table> = {
  id: string;
  row: TablesUpdate<T>;
};
