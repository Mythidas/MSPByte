import { Tables, TablesInsert, TablesUpdate } from '@/types/db';
import { Debug } from '@/lib/utils';
import {
  getSourceDevices,
  putSourceDevices,
  deleteSourceDevices,
  updateSourceDevice,
} from '@/services/devices';
import { APIResponse } from '@/types';

export async function syncDevices(
  tenant: Tables<'source', 'tenants'>,
  spDevices: TablesInsert<'source', 'devices'>[]
): Promise<APIResponse<Tables<'source', 'devices'>[]>> {
  try {
    const existingDevices = await getSourceDevices(tenant.source_id, [tenant.site_id]);
    if (!existingDevices.ok) {
      throw new Error(existingDevices.error.message);
    }

    const toInsert: TablesInsert<'source', 'devices'>[] = [];
    const toUpdate: TablesUpdate<'source', 'devices'>[] = [];

    for (const device of spDevices) {
      const existing = existingDevices.data.rows.find((i) => i.external_id === device.id);

      if (existing) toUpdate.push({ ...existing, ...device });
      else toInsert.push({ ...device });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingDevices.data.rows
      .filter((item) => !updateIds.has(item.external_id))
      .map((item) => item.id);

    const inserted = await putSourceDevices(toInsert);
    if (!inserted.ok) {
      throw new Error('Failed to insert source devices');
    }
    const deleted = await deleteSourceDevices(toDelete);
    if (!deleted.ok) {
      Debug.warn({
        module: 'SophosPartner',
        context: 'syncDevices',
        message: 'Failed to delete source devices',
        time: new Date(),
      });
    }

    const devices = [...inserted.data];
    for await (const update of toUpdate) {
      const updated = await updateSourceDevice(update.id!, update);
      if (!updated.ok) {
        Debug.warn({
          module: 'SophosPartner',
          context: 'syncDevices',
          message: 'Failed to update source device',
          time: new Date(),
        });
      } else {
        devices.push({ ...updated.data });
      }
    }

    return {
      ok: true,
      data: devices,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'syncDevices',
      message: String(err),
      time: new Date(),
    });
  }
}
