import { deleteRows, getRows, insertRows, updateRow } from '@/db/orm';
import { Tables, TablesInsert, TablesUpdate } from '@/types/db';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function syncCompanies(
  job: Tables<'public', 'source_sync_jobs'>,
  companies: TablesInsert<'source', 'sites'>[]
): Promise<APIResponse<Tables<'source', 'sites'>[]>> {
  try {
    const existingCompanies = await getRows('source', 'sites', {
      filters: [['source_id', 'eq', job.source_id]],
    });
    if (!existingCompanies.ok) {
      throw new Error(existingCompanies.error.message);
    }

    const toInsert: TablesInsert<'source', 'sites'>[] = [];
    const toUpdate: TablesUpdate<'source', 'sites'>[] = [];

    for (const company of companies) {
      const existing = existingCompanies.data.rows.find(
        (i) => i.external_id === company.external_id
      );

      if (existing) toUpdate.push({ ...existing, ...company, sync_id: job.id });
      else toInsert.push({ ...company, sync_id: job.id });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingCompanies.data.rows
      .filter((item) => !updateIds.has(item.external_id))
      .map((item) => item.id);

    const inserted = await insertRows('source', 'sites', {
      rows: toInsert,
    });
    if (!inserted.ok) {
      throw new Error('Failed to insert source sites');
    }
    const deleted = await deleteRows('source', 'sites', {
      filters: [['id', 'in', toDelete]],
    });
    if (!deleted.ok) {
      Debug.warn({
        module: 'AutoTask',
        context: 'syncCompanies',
        message: 'Failed to delete source sites',
        time: new Date(),
      });
    }

    const finalCompanies = [...inserted.data];
    for await (const update of toUpdate) {
      const updated = await updateRow('source', 'sites', {
        id: update.id!,
        row: update,
      });
      if (!updated.ok) {
        Debug.warn({
          module: 'AutoTask',
          context: 'syncCompanies',
          message: 'Failed to update source site',
          time: new Date(),
        });
      } else {
        companies.push({ ...updated.data });
      }
    }

    return {
      ok: true,
      data: finalCompanies,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'syncCompanies',
      message: String(err),
      time: new Date(),
    });
  }
}
