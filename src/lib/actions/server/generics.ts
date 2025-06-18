import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { TablesInsert, Tables, Database, TablesUpdate } from "@/types/database";
import { createClient } from "@/utils/supabase/server";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export async function TablesSelectGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  modifyQuery?: (query: PostgrestFilterBuilder<
    Database['public'],
    Database['public']['Tables'][T]['Row'],
    Database['public']['Tables'][T]['Row'],
    'public',
    Database['public']['Tables']
  >) => void
): Promise<ActionResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from(table)
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
      data: results as Tables<T>[],
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_${String(table)}`,
      message: String(err),
      time: new Date()
    });
  }
}


export async function TablesInsertGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  rows: TablesInsert<T>[]
): Promise<ActionResponse<Tables<T>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(table)
      .insert(rows as any)
      .select();

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: data as Tables<T>[]
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `insert_${String(table)}`,
      message: String(err),
      time: new Date()
    });
  }
}

export async function TablesUpdateGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
  row: TablesUpdate<T>
): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from(table)
      .update(row as any)
      .eq('id', id as any);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `update_${String(table)}`,
      message: String(err),
      time: new Date()
    });
  }
}

export async function TablesDeleteGeneric<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string,
): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id as any);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `delete_${String(table)}`,
      message: String(err),
      time: new Date()
    });
  }
}