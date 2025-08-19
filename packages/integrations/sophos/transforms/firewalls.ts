import { Tables, TablesInsert } from '@/types/db';
import { generateUUID } from '@/shared/lib/utils';
import { SPFirewall } from '@/integrations/sophos/types/firewall';

export function transformDevices(
  mapping: Tables<'source', 'tenants'>,
  devices: SPFirewall[]
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
      os: device.firmwareVersion,
      serial: device.serialNumber,
      type: 'firewall',
      external_ip: device.externalIpv4Addresses[0] || '',

      metadata: device,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}
