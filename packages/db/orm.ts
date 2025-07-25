'use server';

'use server';

import { tables } from '@/db';
import { GetRowConfig, InsertRowConfig, Table, TableOrView, UpdateRowConfig } from '@/types/db';

export async function getRow<T extends TableOrView>(table: T, config: GetRowConfig<T>) {
  return tables.selectSingle(table, (query) => {
    if (config.filters) {
      for (const [col, op, val] of config.filters) {
        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function getRows<T extends TableOrView>(table: T, config: GetRowConfig<T>) {
  return tables.select(
    table,
    (query) => {
      if (config.filters) {
        for (let [col, op, val] of config.filters) {
          query = query.filter(col as string, op, val);
        }
      }
    },
    config.pagination
  );
}

export async function insertRows<T extends Table>(table: T, config: InsertRowConfig<T>) {
  return tables.insert(table, config.rows, (query) => {
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
