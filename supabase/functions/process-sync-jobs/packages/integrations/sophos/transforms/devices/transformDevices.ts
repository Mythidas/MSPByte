import { Tables, TablesInsert } from '../../../../db/schema.ts';
import { SPEndpoint } from '../../types/endpoints.ts';

export function transformDevices(
  tenant: Tables<'source_tenants'>,
  devices: SPEndpoint[]
): TablesInsert<'source_devices'>[] {
  return devices.map((device) => {
    return {
      tenant_id: tenant.tenant_id,
      site_id: tenant.site_id,
      source_id: tenant.source_id,
      external_id: device.id,
      hostname: device.hostname,
      os: device.os.name,
      serial: 'Unknown',
      metadata: device,
    };
  });
}
