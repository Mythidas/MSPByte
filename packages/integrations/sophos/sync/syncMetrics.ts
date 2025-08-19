import { Tables, TablesInsert } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { insertRows } from '@/db/orm';

export async function syncMetrics(
  tenant: Tables<'source', 'tenants'>,
  devices: Tables<'source', 'devices'>[]
): Promise<APIResponse<null>> {
  try {
    let upgradeable = 0;
    let mdrManaged = 0;
    let tamperDisabledCount = 0;
    for (const device of devices) {
      if (device.type !== 'computer') continue;

      if ((device.metadata as SPEndpoint).packages?.protection?.status === 'upgradable')
        upgradeable++;
      if ((device.metadata as SPEndpoint).mdrManaged) mdrManaged++;
      if (!(device.metadata as SPEndpoint).tamperProtectionEnabled) tamperDisabledCount++;
    }

    const mdrManagedDevices: TablesInsert<'source', 'metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      source_tenant_id: tenant.id,
      definition_id: 'ymeoaq0z',
      metric: mdrManaged,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    const upgradableDevices: TablesInsert<'source', 'metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      source_tenant_id: tenant.id,
      definition_id: 'liydr8yz',
      metric: upgradeable,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    const tamperDisabled: TablesInsert<'source', 'metrics'> = {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      source_tenant_id: tenant.id,
      definition_id: '7q1ycluz',
      metric: tamperDisabledCount,
      total: devices.length,
      created_at: new Date().toISOString(),
    };

    await insertRows('source', 'metrics', {
      rows: [mdrManagedDevices, upgradableDevices, tamperDisabled],
    });

    return {
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncMetrics',
      message: String(err),
    });
  }
}
