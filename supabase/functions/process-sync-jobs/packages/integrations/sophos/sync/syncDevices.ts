import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables, TablesInsert, TablesUpdate } from '../../../db/schema.ts';
import {
  getSourceDevices,
  putSourceDevices,
  deleteSourceDevices,
  updateSourceDevice,
} from '../../../services/devices.ts';

export async function syncDevices(
  mapping: Tables<'site_source_mappings'>,
  spDevices: TablesInsert<'source_devices'>[]
): Promise<APIResponse<Tables<'source_devices'>[]>> {
  try {
    const existingDevices = await getSourceDevices(mapping.source_id, [mapping.site_id]);
    if (!existingDevices.ok) {
      throw new Error(existingDevices.error.message);
    }

    const toInsert: TablesInsert<'source_devices'>[] = [];
    const toUpdate: TablesUpdate<'source_devices'>[] = [];

    for (const device of spDevices) {
      const existing = existingDevices.data.find((i) => i.external_id === device.id);

      if (existing) toUpdate.push({ ...existing, ...device });
      else toInsert.push({ ...device });
    }

    const updateIds = new Set(toUpdate.map((u) => u.external_id));
    const toDelete = existingDevices.data
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
