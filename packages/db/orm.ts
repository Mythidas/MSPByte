'use server';

import { tables } from '@/db';
import {
  DeleteRowConfig,
  GetRowConfig,
  GetRowCountConfig,
  InsertRowConfig,
  Table,
  TableOrView,
  UpdateRowConfig,
  UpdateRowsConfig,
  UpsertRowConfig,
} from '@/types/db';

export async function getRow<T extends TableOrView>(table: T, config?: GetRowConfig<T>) {
  return tables.selectSingle(table, (query) => {
    if (config && config.filters) {
      for (const filter of config.filters) {
        if (!filter) continue;

        let [col, op, val] = filter;
        if (op === 'in' && Array.isArray(val)) {
          val = `(${val.join(',')})`;
        }

        query = query.filter(col as string, op, val);
      }
    }

    if (config && config.sorting) {
      for (const sorting of config.sorting) {
        if (!sorting) continue;
        const [col, dir] = sorting;

        query = query.order(col as string, { ascending: dir === 'asc' });
      }
    }
  });
}

export async function getRows<T extends TableOrView>(table: T, config?: GetRowConfig<T>) {
  return tables.select(
    table,
    (query) => {
      if (config && config.filters) {
        for (const filter of config.filters) {
          if (!filter) continue;

          let [col, op, val] = filter;
          if (op === 'in' || (op === 'not.in' && Array.isArray(val))) {
            val = `(${val.join(',')})`;
          }

          query = query.filter(col as string, op, val);
        }
      }

      if (config && config.sorting) {
        for (const sort of config.sorting) {
          if (!sort) continue;

          let [col, dir] = sort;
          query = query.order(col as string, { ascending: dir === 'asc' });
        }
      }
    },
    config?.pagination
  );
}

export async function getRowsCount<T extends TableOrView>(table: T, config?: GetRowCountConfig<T>) {
  return tables.count(table, (query) => {
    if (config && config.filters) {
      for (const filter of config.filters) {
        if (!filter) continue;

        let [col, op, val] = filter;
        if (op === 'in' && Array.isArray(val)) {
          val = `(${val.join(',')})`;
        }

        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function insertRows<T extends Table>(table: T, config: InsertRowConfig<T>) {
  return tables.insert(table, config.rows);
}

export async function updateRow<T extends Table>(table: T, config: UpdateRowConfig<T>) {
  return tables.update(table, config.id, config.row);
}

export async function updateRows<T extends Table>(table: T, config: UpdateRowsConfig<T>) {
  return tables.updates(table, config.rows);
}

export async function upsertRows<T extends Table>(table: T, config: UpsertRowConfig<T>) {
  return tables.upsert(table, config.rows, (query) => {
    if (config.filters) {
      for (const filter of config.filters) {
        if (!filter) continue;

        let [col, op, val] = filter;
        if (op === 'in' && Array.isArray(val)) {
          val = `(${val.join(',')})`;
        }

        query = query.filter(col as string, op, val);
      }
    }
  });
}

export async function deleteRows<T extends Table>(table: T, config: DeleteRowConfig<T>) {
  return tables.delete(table, (query) => {
    for (const filter of config.filters) {
      if (!filter) continue;

      let [col, op, val] = filter;
      if (op === 'in' && Array.isArray(val)) {
        val = `(${val.join(',')})`;
      }

      query = query.filter(col as string, op, val);
    }
  });
}
