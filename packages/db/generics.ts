import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { createClient } from 'packages/db/server';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Database, Tables, TablesInsert, TablesUpdate } from 'packages/db/schema';

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
  rows: TablesInsert<T>[]
): Promise<APIResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .insert(rows as any)
      .select();

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
