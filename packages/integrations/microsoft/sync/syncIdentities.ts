import { Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { Debug } from '@/lib/utils';
import {
  getSourceIdentities,
  putSourceIdentities,
  updateSourceIdentity,
} from '@/services/identities';
import { APIResponse } from '@/types';

export async function syncIdentities(
  tenant: Tables<'source_tenants'>,
  graphUsers: TablesInsert<'source_identities'>[],
  sync_id: string
): Promise<APIResponse<Tables<'source_identities'>[]>> {
  try {
    const existingIdentities = await getSourceIdentities(tenant.source_id!, [tenant.site_id!]);
    if (!existingIdentities.ok) {
      throw new Error(existingIdentities.error.message);
    }

    const toInsert: TablesInsert<'source_identities'>[] = [];
    const toUpdate: TablesUpdate<'source_identities'>[] = [];

    for (const user of graphUsers) {
      const existing = existingIdentities.data.rows.find((i) => i.external_id === user.external_id);

      if (existing) toUpdate.push({ ...existing, ...user, sync_id });
      else toInsert.push({ ...user, sync_id });
    }

    const inserted = await putSourceIdentities(toInsert);
    if (!inserted.ok) {
      throw new Error('Failed to insert source identities');
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
