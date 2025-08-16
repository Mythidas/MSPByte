'use server';

import { tables } from '@/db';
import {
  DeleteRowConfig,
  GetRowConfig,
  GetRowCountConfig,
  InsertRowConfig,
  Schemas,
  Table,
  TableOrView,
  UpdateRowConfig,
  UpsertRowConfig,
} from '@/types/db';

export async function getRow<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  config?: GetRowConfig<S, T>
) {
  return tables.selectSingle(schema, table, (query) => {
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

    if (config && config.ors) {
      for (const or of config.ors) {
        if (!or) continue;

        let [first, second] = or;
        if (!first || !second) continue;

        query = query.or(
          `${first[0]}.${first[1]}.${first[2]},${second[0]}.${second[1]}.${second[2]}`
        );
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

export async function getRows<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  config?: GetRowConfig<S, T>
) {
  return tables.select(
    schema,
    table,
    (query) => {
      if (config && config.filters) {
        for (const filter of config.filters) {
          if (!filter) continue;

          let [col, op, val] = filter;
          if (op === 'in' || Array.isArray(val)) {
            val = `(${val.join(',')})`;
          }

          query = query.filter(col as string, op, val);
        }
      }

      if (config && config.ors) {
        for (const or of config.ors) {
          if (!or) continue;

          let [first, second] = or;
          if (!first || !second) continue;

          query = query.or(
            `${first[0]}.${first[1]}.${first[2]},${second[0]}.${second[1]}.${second[2]}`
          );
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

export async function getRowsCount<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  config?: GetRowCountConfig<S, T>
) {
  return tables.count(schema, table, (query) => {
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

    if (config && config.ors) {
      for (const or of config.ors) {
        if (!or) continue;

        let [first, second] = or;
        if (!first || !second) continue;

        query = query.or(
          `${first[0]}.${first[1]}.${first[2]},${second[0]}.${second[1]}.${second[2]}`
        );
      }
    }
  });
}

export async function insertRows<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  config: InsertRowConfig<S, T>
) {
  return tables.insert(schema, table, config.rows);
}

export async function updateRow<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  config: UpdateRowConfig<S, T>
) {
  return tables.update(schema, table, config.id, config.row);
}

export async function upsertRows<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  config: UpsertRowConfig<S, T>
) {
  return tables.upsert(schema, table, config.rows, (query) => {
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

    if (config && config.ors) {
      for (const or of config.ors) {
        if (!or) continue;

        let [first, second] = or;
        if (!first || !second) continue;

        query = query.or(
          `${first[0]}.${first[1]}.${first[2]},${second[0]}.${second[1]}.${second[2]}`
        );
      }
    }
  });
}

export async function deleteRows<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  config: DeleteRowConfig<S, T>
) {
  return tables.delete(schema, table, (query) => {
    for (const filter of config.filters) {
      if (!filter) continue;

      let [col, op, val] = filter;
      if (op === 'in' && Array.isArray(val)) {
        val = `(${val.join(',')})`;
      }

      query = query.filter(col as string, op, val);
    }

    if (config && config.ors) {
      for (const or of config.ors) {
        if (!or) continue;

        let [first, second] = or;
        if (!first || !second) continue;

        query = query.or(
          `${first[0]}.${first[1]}.${first[2]},${second[0]}.${second[1]}.${second[2]}`
        );
      }
    }
  });
}
