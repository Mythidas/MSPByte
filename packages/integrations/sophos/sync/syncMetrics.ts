import { Tables } from '@/db/schema';
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

    const totalDevices = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'Total Devices',
      metric: devices.length,
      unit: 'devices',
      total: null,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices' },
      metadata: {},
      is_historic: false,
      visual: null,
      thresholds: null,
      created_at: new Date().toISOString(),
    };

    const mdrManagedDevices = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'MDR Managed Devices',
      metric: mdrManaged,
      unit: 'devices',
      total: devices.length,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices', filter: 'protection+eq+MDR' },
      metadata: {},
      is_historic: false,
      visual: 'progress',
      thresholds: { info: 100, warn: 50, highest: true },
      created_at: new Date().toISOString(),
    };

    const upgradableDevices = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      name: 'Upgradable Devices',
      metric: upgradeable,
      unit: 'devices',
      total: devices.length,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices', filter: 'status+eq+upgradable' },
      metadata: {},
      is_historic: false,
      visual: 'progress',
      thresholds: { info: 0, warn: 30, crticial: 60, highest: false },
      created_at: new Date().toISOString(),
    };

    // await putSourceMetrics([totalDevices, mdrManagedDevices, upgradableDevices]);

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
