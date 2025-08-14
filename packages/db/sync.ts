import { deleteRows, getRows, insertRows, updateRow, upsertRows } from '@/db/orm';
import { RowFilter, Schemas, Table, Tables, TablesInsert, TablesUpdate } from '@/types/db';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function syncTableItems<S extends Schemas, T extends Table<S>>(
  schema: S,
  table: T,
  job: Tables<'source', 'sync_jobs'>,
  items: TablesInsert<S, T>[],
  existingFilters: RowFilter<S, T>[],
  uniqueKey: keyof TablesInsert<S, T>,
  primaryKey: keyof Tables<S, T>,
  module: string,
  shouldDelete: boolean = true
): Promise<APIResponse<Tables<S, T>[]>> {
  const context: string = `${schema}.${table as string}`;

  try {
    const existing = await getRows(schema, table, {
      filters: existingFilters,
    });
    if (existing.error) {
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
    if (shouldDelete) {
      const toDelete = existing.data.rows
        .filter((item) => !updateIds.has(item[uniqueKey as keyof Tables<S, T>] as string))
        .map((item) => item[primaryKey]);
      const deleted = await deleteRows(schema, table, {
        filters: [[primaryKey, 'in', toDelete]] as any,
      });
      if (deleted.error) {
        Debug.warn({
          module,
          context,
          message: deleted.error.message,
        });
      }
    }

    const updated = await upsertRows(schema, table, {
      rows: [...toUpdate, ...toInsert],
    });
    if (updated.error) {
      Debug.warn({
        module,
        context,
        message: updated.error.message,
      });
    }

    return {
      data: !updated.error ? updated.data : [],
    };
  } catch (err) {
    return Debug.error({
      module,
      context,
      message: String(err),
    });
  }
}
