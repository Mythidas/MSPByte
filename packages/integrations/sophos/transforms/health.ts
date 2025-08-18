import { Tables, TablesInsert } from '@/types/db';
import { generateUUID } from '@/shared/lib/utils';
import { SPHealthCheck } from '@/integrations/sophos/types/health';

export function transformTenantHealth(
  mapping: Tables<'source', 'tenants'>,
  health: SPHealthCheck
): TablesInsert<'source', 'tenant_health'> {
  return {
    id: generateUUID(),
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    source_tenant_id: mapping.id,

    score: getScore(health),

    metadata: health,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const getScore = (health: SPHealthCheck) => {
  const total =
    health.endpoint.exclusions.global.score +
    health.endpoint.exclusions.policy.computer.score +
    health.endpoint.exclusions.policy.server.score +
    health.endpoint.policy.computer['threat-protection'].score +
    health.endpoint.policy.server['server-threat-protection'].score +
    health.endpoint.protection.computer.score +
    health.endpoint.protection.server.score +
    (health.networkDevice?.firewall.firewallAutomaticBackup.score || 0);
  return health.networkDevice ? total / 8 : total / 7;
};
