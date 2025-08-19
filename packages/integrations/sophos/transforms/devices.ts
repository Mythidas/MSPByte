import { Tables, TablesInsert } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import { generateUUID } from '@/shared/lib/utils';
import { SPFirewall } from '@/integrations/sophos/types/firewall';

export function transformDevices(
  mapping: Tables<'source', 'tenants'>,
  devices: SPEndpoint[],
  firewalls: SPFirewall[]
): TablesInsert<'source', 'devices'>[] {
  const tEndpoints = devices.map((device) => {
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
      type: 'computer',
      internal_ip: device.ipv4Addresses[0] || '',

      metadata: device,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const tFirewalls = firewalls.map((fw) => {
    return {
      id: generateUUID(),
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      source_tenant_id: mapping.id,

      external_id: fw.id,
      hostname: fw.hostname,
      os: fw.firmwareVersion,
      serial: fw.serialNumber,
      type: 'firewall',
      external_ip: fw.externalIpv4Addresses[0] || '',

      metadata: fw,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  return [...tEndpoints, ...tFirewalls];
}
