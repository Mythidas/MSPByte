import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables, TablesInsert, TablesUpdate } from '../../../db/schema.ts';
import {
  getSourceIdentities,
  putSourceIdentities,
  deleteSourceIdentities,
  updateSourceIdentity,
} from '../../../services/identities.ts';

export async function syncIdentities(
  tenant: Tables<'source_tenants'>,
  graphUsers: TablesInsert<'source_identities'>[]
): Promise<APIResponse<Tables<'source_identities'>[]>> {
  try {
    const existingIdentities = await getSourceIdentities(tenant.source_id!, tenant.site_id!);
    if (!existingIdentities.ok) {
      throw new Error(existingIdentities.error.message);
    }

    const toInsert: TablesInsert<'source_identities'>[] = [];
    const toUpdate: TablesUpdate<'source_identities'>[] = [];

    for (const user of graphUsers) {
      const existing = existingIdentities.data.find((i) => i.external_id === user.id);

      if (existing) toUpdate.push({ ...existing, ...user });
      else toInsert.push({ ...user });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingIdentities.data
      .filter((item) => !updateIds.has(item.external_id))
      .map((item) => item.id);

    const inserted = await putSourceIdentities(toInsert);
    if (!inserted.ok) {
      throw new Error('Failed to insert source identities');
    }
    const deleted = await deleteSourceIdentities(toDelete);
    if (!deleted.ok) {
      Debug.warn({
        module: 'Microsoft365',
        context: 'syncIdentities',
        message: 'Failed to delete source identities',
        time: new Date(),
      });
    }

    const identities = [...inserted.data];
    for await (const update of toUpdate) {
      const updated = await updateSourceIdentity(update.id!, update);
      if (!updated.ok) {
        Debug.warn({
          module: 'Microsoft365',
          context: 'syncIdentities',
          message: 'Failed to update source identity',
          time: new Date(),
        });
      } else {
        identities.push({ ...updated.data });
      }
    }

    return {
      ok: true,
      data: identities,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncIdentities',
      message: String(err),
      time: new Date(),
    });
  }
}
