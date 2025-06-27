import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables, TablesInsert, TablesUpdate } from '../../../db/schema.ts';
import {
  getSourcePolicies,
  putSourcePolicies,
  deleteSourcePolicies,
  updateSourcePolicy,
} from '../../../services/policies.ts';

export async function syncPolicies(
  mapping: Tables<'site_source_mappings'>,
  caPolicies: TablesInsert<'source_policies'>[]
): Promise<APIResponse<Tables<'source_policies'>[]>> {
  try {
    const existingPolicies = await getSourcePolicies(mapping.source_id, [mapping.site_id]);
    if (!existingPolicies.ok) {
      throw new Error(existingPolicies.error.message);
    }

    const toInsert: TablesInsert<'source_policies'>[] = [];
    const toUpdate: TablesUpdate<'source_policies'>[] = [];

    for (const policy of caPolicies) {
      const existing = existingPolicies.data.find((i) => i.external_id === policy.id);

      if (existing) toUpdate.push({ ...existing, ...policy });
      else toInsert.push({ ...policy });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingPolicies.data
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
