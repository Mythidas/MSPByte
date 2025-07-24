'use server';

'use server';

import { tables } from '@/db';
import { TablesInsert, TablesUpdate } from '@/db/schema';
import { GetRowConfig, InsertRowConfig, Table, UpdateRowConfig } from '@/types/db';

export async function getRow<T extends Table>(table: T, config: GetRowConfig<T>) {
  return tables.selectSingle(table, (query) => {
    if (config.filters) {
      for (const [col, op, val] of config.filters) {
        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function getRows<T extends Table>(table: T, config: GetRowConfig<T>) {
  return tables.select(table, (query) => {
    if (config.filters) {
      for (const [col, op, val] of config.filters) {
        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function insertRows<T extends Table>(table: T, config: InsertRowConfig<T>) {
  return tables.insert(table, config.rows as TablesInsert<T>[], (query) => {
    if (config.filters) {
      for (const [col, op, val] of config.filters) {
        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function updateRow<T extends Table>(table: T, config: UpdateRowConfig<T>) {
  return tables.update(table, config.id, config.row);
}
