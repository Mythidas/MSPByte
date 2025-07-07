import { Tables, TablesInsert } from '@/db/schema';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';

export function transformDevices(
  mapping: Tables<'source_tenants'>,
  devices: SPEndpoint[]
): TablesInsert<'source_devices'>[] {
  return devices.map((device) => {
    return {
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      external_id: device.id,
      hostname: device.hostname,
      os: device.os.name,
      serial: 'Unknown',
      metadata: device,
    };
  });
}
