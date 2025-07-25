import { getRows, insertRows, updateRow } from '@/db/orm';
import { Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { deleteRows } from '@/services/general';
import { APIResponse } from '@/types';

export async function syncLicenses(
  tenant: Tables<'source_tenants'>,
  licenses: TablesInsert<'source_licenses'>[],
  sync_id: string
): Promise<APIResponse<Tables<'source_licenses'>[]>> {
  try {
    const existingLicenses = await getRows('source_licenses', {
      filters: [
        ['source_id', 'eq', tenant.source_id],
        ['site_id', 'eq', tenant.site_id],
      ],
    });
    if (!existingLicenses.ok) {
      throw new Error(existingLicenses.error.message);
    }

    const toInsert: TablesInsert<'source_licenses'>[] = [];
    const toUpdate: TablesUpdate<'source_licenses'>[] = [];

    for (const policy of licenses) {
      const existing = existingLicenses.data.rows.find((i) => i.external_id === policy.id);

      if (existing) toUpdate.push({ ...existing, ...policy, sync_id });
      else toInsert.push({ ...policy, sync_id });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingLicenses.data.rows
      .filter((item) => !updateIds.has(item.external_id))
      .map((item) => item.id);

    const inserted = await insertRows('source_licenses', { rows: toInsert });
    if (!inserted.ok) {
      throw new Error('Failed to insert source licenses');
    }
    const deleted = await deleteRows('source_licenses', toDelete);
    if (!deleted.ok) {
      Debug.warn({
        module: 'Microsoft365',
        context: 'syncLicenses',
        message: 'Failed to delete source licenses',
        time: new Date(),
      });
    }

    const policies = [...inserted.data];
    for await (const update of toUpdate) {
      const updated = await updateRow('source_licenses', { id: update.id!, row: update });
      if (!updated.ok) {
        Debug.warn({
          module: 'Microsoft365',
          context: 'syncLicenses',
          message: 'Failed to update source license',
          time: new Date(),
        });
      } else {
        policies.push({ ...updated.data });
      }
    }

    return {
      ok: true,
      data: policies,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncLicenses',
      message: String(err),
      time: new Date(),
    });
  }
}
