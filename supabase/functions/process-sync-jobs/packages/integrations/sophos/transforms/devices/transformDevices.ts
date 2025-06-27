import { Tables, TablesInsert } from '../../../../db/schema.ts';
import { SPEndpoint } from '../../types/endpoints.ts';

export function transformDevices(
  mapping: Tables<'site_source_mappings'>,
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
