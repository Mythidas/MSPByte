import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { createClient } from 'packages/db/server';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Database, Tables, TablesInsert, TablesUpdate } from 'packages/db/schema';
import { Filters, PaginationOptions } from '@/types/data-table';

type TableOrView = keyof Database['public']['Tables'] | keyof Database['public']['Views'];
type RowType<T extends TableOrView> = T extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][T]['Row']
  : T extends keyof Database['public']['Views']
    ? Database['public']['Views'][T]['Row']
    : never;
type QueryBuilder<T extends TableOrView> = PostgrestFilterBuilder<
  Database['public'],
  RowType<T>,
  RowType<T>
>;

export async function tablesCountGeneric<T extends TableOrView>(
  table: T,
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<number>> {
  try {
    const supabase = await createClient();

    let query = supabase.from(table as any).select('*', { count: 'exact', head: true }); // head = no rows, just headers/meta

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

export async function tablesSelectGeneric<T extends TableOrView>(
  table: T,
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.from(table as any).select('*');

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
      data: results as Tables<T>[],
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

export async function tablesSelectPaginated<T extends TableOrView>(
  table: T,
  pagination: PaginationOptions,
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<{ rows: Tables<T>[]; total: number }>> {
  try {
    const supabase = await createClient();

    const from = pagination.page * pagination.size;
    const to = from + pagination.size - 1;

    let query = supabase
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
        rows: (data as Tables<T>[]) ?? [],
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

export function paginatedFilters<T extends TableOrView>(
  query: QueryBuilder<T>,
  filters: Filters,
  map?: Record<string, string>
): QueryBuilder<T> {
  for (const [key, { op, value }] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    const column = map ? (map[key] ?? key) : key;
    console.log(column);

    switch (op) {
      case 'lk':
        query = query.ilike(column as any, `%${value}%`);
        break;
      case 'eq':
        query = query.eq(column as any, value);
        break;
      case 'ne':
        query = query.neq(column as any, value);
        break;
      case 'gt':
        query = query.gte(column as any, value);
        break;
      case 'lt':
        query = query.lte(column as any, value);
        break;
      case 'in':
        if (Array.isArray(value)) {
          query = query.overlaps(column as any, value);
        }
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

export async function tablesSelectSingleGeneric<T extends TableOrView>(
  table: T,
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<Tables<T>>> {
  try {
    const supabase = await createClient();
    let query = supabase.from(table as any).select('*');

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.single();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<T>,
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

export async function tablesInsertGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  rows: TablesInsert<T>[],
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.from(table).insert(rows as any);

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.select();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<T>[],
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

export async function tablesUpdateGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  row: TablesUpdate<T>
): Promise<APIResponse<Tables<T>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .update(row as any)
      .eq('id', id as any)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<T>,
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

export async function tablesUpsertGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  rows: TablesUpdate<T>[],
  modifyQuery?: (query: QueryBuilder<T>) => void
): Promise<APIResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase.from(table).upsert(rows as any);

    if (modifyQuery) {
      modifyQuery(query as any);
    }

    const { data, error } = await query.select();
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<T>[],
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

export async function tablesDeleteGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  ids: string[]
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids as any);

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

export async function tablesRPCGeneric<
  Fn extends keyof Database['public']['Functions'],
  Args extends Database['public']['Functions'][Fn]['Args'],
  Ret = Database['public']['Functions'][Fn]['Returns'],
>(fn: Fn, args: Args): Promise<APIResponse<Ret>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(fn, args);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Ret,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `rpc_${String(fn)}`,
      message: String(err),
      time: new Date(),
    });
  }
}
