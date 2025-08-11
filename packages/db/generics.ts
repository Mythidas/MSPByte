import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { createClient } from 'packages/db/server';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
  DataResponse,
  Filters,
  PaginationOptions,
  Schemas,
  Table,
  TableOrView,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/db';
import { subDays } from 'date-fns';
import { Database } from '@/db/schema';

type RowType<
  S extends Schemas,
  T extends TableOrView<S>,
> = T extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][T]['Row']
  : T extends keyof Database['public']['Views']
    ? Database['public']['Views'][T]['Row']
    : T extends keyof Database['source']['Tables']
      ? Database['source']['Tables'][T]['Row']
      : T extends keyof Database['source']['Views']
        ? Database['source']['Views'][T]['Row']
        : never;
type QueryBuilder<S extends Schemas, T extends TableOrView<S>> = PostgrestFilterBuilder<
  Database['public'],
  RowType<S, T>,
  RowType<S, T>
>;

export async function tablesCountGeneric<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<number>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .schema(schema)
      .from(table as any)
      .select('*', { count: 'exact', head: true }); // head = no rows, just headers/meta

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { count, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: count ?? 0,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `count_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesSelectGeneric<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  modifyQuery?: (query: QueryBuilder<S, T>) => void,
  pagination?: PaginationOptions
): Promise<APIResponse<DataResponse<Tables<S, T>>>> {
  if (pagination) return tablesSelectPaginated(schema, table, pagination, modifyQuery);

  try {
    const supabase = await createClient();
    let query = supabase
      .schema(schema)
      .from(table as any)
      .select('*');

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    let results = [];

    while (true) {
      const { data, error } = await query.range(results.length, results.length + 999);

      if (error) throw new Error(error.message);

      results.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }

    return {
      ok: true,
      data: { rows: results as Tables<S, T>[], total: results.length } as DataResponse<
        Tables<S, T>
      >,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesSelectPaginated<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  pagination: PaginationOptions,
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<DataResponse<Tables<S, T>>>> {
  try {
    const supabase = await createClient();

    const from = pagination.page * pagination.size;
    const to = from + pagination.size - 1;

    let query = supabase
      .schema(schema)
      .from(table as any)
      .select('*', { count: 'exact' }) // includes count in response
      .range(from, to);

    if (pagination.filters) {
      paginatedFilters(query as any, pagination.filters, pagination.filterMap);
    }

    if (pagination.globalFields && pagination.globalSearch) {
      const value = `%${pagination.globalSearch}%`;
      query = query.or(pagination.globalFields.map((col) => `${col}.ilike.${value}`).join(','));
    }

    if (pagination.sorting && Object.entries(pagination.sorting).length) {
      const [key, value] = Object.entries(pagination.sorting)[0];
      const keyMap = pagination.filterMap ? (pagination.filterMap[key] ?? key) : key;
      query = query.order(keyMap, { ascending: value === 'asc' });
    }

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, count, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: {
        rows: (data as Tables<S, T>[]) ?? [],
        total: count ?? 0,
      },
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `paginated_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export function paginatedFilters<S extends Schemas, T extends TableOrView<S>>(
  query: QueryBuilder<S, T>,
  filters: Filters,
  map?: Record<string, string>
): QueryBuilder<S, T> {
  for (let [key, { op, value }] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    const column = map ? (map[key] ?? key) : key;

    switch (op) {
      case 'like':
      case 'ilike':
        value = `%${value}%`;

      case 'gte':
      case 'lte':
      case 'gt':
      case 'lt':
        if (key.includes('_at')) {
          value = subDays(new Date(), value as number).toISOString();
        }

      case 'is':
      case 'not':
      case 'eq':
      case 'neq':
      case 'in':
        if (Array.isArray(value)) {
          value = `(${value.join(',')})`;
        }

        query = query.filter(column as string, op, value);
        break;
      case 'bt':
        if (Array.isArray(value)) {
          query = query.gte(column as any, value[0]).lte(column as any, value[0]);
        }
        break;
      default:
        throw new Error(`Unsupported operator: ${op}`);
    }
  }

  return query;
}

export async function tablesSelectSingleGeneric<S extends Schemas, T extends TableOrView<S>>(
  schema: S,
  table: T,
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<Tables<S, T>>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema(schema)
      .from(table as any)
      .select('*');

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.single();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<S, T>,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesInsertGeneric<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  rows: TablesInsert<S, T>[],
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<Tables<S, T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.schema(schema).from(table as any);

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.insert(rows as any).select();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<S, T>[],
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `insert_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesUpdateGeneric<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  id: string,
  row: TablesUpdate<S, T>
): Promise<APIResponse<Tables<S, T>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema(schema)
      .from(table as any)
      .update(row as any)
      .eq('id', id as any)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<S, T>,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `update_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesUpsertGeneric<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  rows: (TablesUpdate<S, T> | TablesInsert<S, T>)[],
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<Tables<S, T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema(schema)
      .from(table as any)
      .upsert(rows as any);

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.select();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<S, T>[],
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `upsert_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function tablesDeleteGeneric<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  modifyQuery?: (query: QueryBuilder<S, T>) => void
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema(schema)
      .from(table as any)
      .delete();

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { error } = await query.select();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `delete_${String(table)}`,
      message: String(err),
      time: new Date(),
    });
  }
}
