import { Database, Tables, TablesInsert, TablesUpdate } from '@/db/schema';

// types.ts
export type Table = keyof Database['public']['Tables'];

export type RowFilter<T extends Table> = [
  column: keyof Tables<T>,
  operator: 'eq' | 'neq',
  value: any,
];

export type GetRowConfig<T extends Table> = {
  filters?: RowFilter<T>[];
};

export type InsertRowConfig<T extends Table> = {
  rows: TablesInsert<T>[];
  filters?: RowFilter<T>[];
};

export type UpdateRowConfig<T extends Table> = {
  id: string;
  row: TablesUpdate<T>;
};
