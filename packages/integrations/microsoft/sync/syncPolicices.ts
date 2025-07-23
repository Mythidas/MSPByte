import { Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { Debug } from '@/lib/utils';
import {
  getSourcePolicies,
  putSourcePolicies,
  deleteSourcePolicies,
  updateSourcePolicy,
} from '@/services/policies';
import { APIResponse } from '@/types';

export async function syncPolicies(
  tenant: Tables<'source_tenants'>,
  caPolicies: TablesInsert<'source_policies'>[],
  sync_id: string
): Promise<APIResponse<Tables<'source_policies'>[]>> {
  try {
    const existingPolicies = await getSourcePolicies(tenant.source_id, [tenant.site_id]);
    if (!existingPolicies.ok) {
      throw new Error(existingPolicies.error.message);
    }

    const toInsert: TablesInsert<'source_policies'>[] = [];
    const toUpdate: TablesUpdate<'source_policies'>[] = [];

    for (const policy of caPolicies) {
      const existing = existingPolicies.data.rows.find((i) => i.external_id === policy.id);

      if (existing) toUpdate.push({ ...existing, ...policy, sync_id });
      else toInsert.push({ ...policy, sync_id });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingPolicies.data.rows
      .filter((item) => !updateIds.has(item.external_id))
      .map((item) => item.id);

    const inserted = await putSourcePolicies(toInsert);
    if (!inserted.ok) {
      throw new Error('Failed to insert source policies');
    }
    const deleted = await deleteSourcePolicies(toDelete);
    if (!deleted.ok) {
      Debug.warn({
        module: 'Microsoft365',
        context: 'syncPolicies',
        message: 'Failed to delete source policies',
        time: new Date(),
      });
    }

    const policies = [...inserted.data];
    for await (const update of toUpdate) {
      const updated = await updateSourcePolicy(update.id!, update);
      if (!updated.ok) {
        Debug.warn({
          module: 'Microsoft365',
          context: 'syncPolicies',
          message: 'Failed to update source policy',
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
      context: 'syncPolicies',
      message: String(err),
      time: new Date(),
    });
  }
}
