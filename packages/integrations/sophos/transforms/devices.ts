import { Tables, TablesInsert } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import { generateUUID } from '@/shared/lib/utils';

export function transformDevices(
  mapping: Tables<'source', 'tenants'>,
  devices: SPEndpoint[]
): TablesInsert<'source', 'devices'>[] {
  return devices.map((device) => {
    return {
      id: generateUUID(),
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      source_tenant_id: mapping.id,
      external_id: device.id,
      hostname: device.hostname,
      os: device.os.name,
      serial: 'Unknown',
      metadata: device,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}
