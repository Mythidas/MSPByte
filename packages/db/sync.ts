import { deleteRows, getRows, insertRows, updateRow, upsertRows } from '@/db/orm';
import { RowFilter, Schemas, Table, Tables, TablesInsert, TablesUpdate } from '@/types/db';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function syncTableItems<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  job: Tables<'public', 'source_sync_jobs'>,
  items: TablesInsert<S, T>[],
  existingFilters: RowFilter<S, T>[],
  uniqueKey: keyof TablesInsert<S, T>,
  primaryKey: keyof Tables<S, T>,
  module: string
): Promise<APIResponse<Tables<S, T>[]>> {
  const context: string = `${schema}.${table as string}`;

  try {
    const existing = await getRows(schema, table, {
      filters: existingFilters,
    });
    if (!existing.ok) {
      throw new Error(existing.error.message);
    }

    const toInsert: TablesInsert<S, T>[] = [];
    const toUpdate: TablesUpdate<S, T>[] = [];

    for (const item of items) {
      const exists = existing.data.rows.find(
        (i) => i[uniqueKey as keyof Tables<S, T>] === item[uniqueKey]
      );

      if (exists) {
        const copied = item as any;
        copied[primaryKey as keyof TablesInsert<S, T>] = exists[primaryKey];
        toUpdate.push({
          ...exists,
          ...copied,
          sync_id: job.id,
        });
      } else toInsert.push({ ...(item as any), sync_id: job.id });
    }

    const updateIds = new Set(
      toUpdate.map((u) => u[uniqueKey as keyof TablesUpdate<S, T>] as string)
    );
    const toDelete = existing.data.rows
      .filter((item) => !updateIds.has(item[uniqueKey as keyof Tables<S, T>] as string))
      .map((item) => item[primaryKey]);
    const deleted = await deleteRows(schema, table, {
      filters: [[primaryKey, 'in', toDelete]] as any,
    });
    if (!deleted.ok) {
      Debug.warn({
        module,
        context,
        message: `Failed to delete ${schema}.${table as string}`,
        time: new Date(),
      });
    }

    const updated = await upsertRows(schema, table, {
      rows: [...toUpdate, ...toInsert],
    });
    if (!updated.ok) {
      Debug.warn({
        module,
        context,
        message: `Failed to upsert ${schema}.${table as string}`,
        time: new Date(),
      });
    }

    return {
      ok: true,
      data: updated.ok ? updated.data : [],
    };
  } catch (err) {
    return Debug.error({
      module,
      context,
      message: String(err),
      time: new Date(),
    });
  }
}
