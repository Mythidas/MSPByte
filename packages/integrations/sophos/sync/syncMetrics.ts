import { Tables, TablesInsert } from '@/db/schema';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import { Debug } from '@/lib/utils';
import { putSourceMetrics } from '@/services/source/metrics';
import { APIResponse } from '@/types';

export async function syncMetrics(
  tenant: Tables<'source_tenants'>,
  devices: Tables<'source_devices'>[]
): Promise<APIResponse<null>> {
  try {
    let upgradeable = 0;
    let mdrManaged = 0;
    for (const device of devices) {
      if ((device.metadata as SPEndpoint).packages?.protection?.status === 'upgradable')
        upgradeable++;
      if ((device.metadata as SPEndpoint).mdrManaged) mdrManaged++;
    }

    const totalDevices: TablesInsert<'source_metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'Total Devices',
      metric: devices.length,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    const mdrManagedDevices: TablesInsert<'source_metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'MDR Managed',
      metric: mdrManaged,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    const upgradableDevices: TablesInsert<'source_metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'Upgradable',
      metric: upgradeable,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    await putSourceMetrics([totalDevices, mdrManagedDevices, upgradableDevices]);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncMetrics',
      message: String(err),
      time: new Date(),
    });
  }
}
