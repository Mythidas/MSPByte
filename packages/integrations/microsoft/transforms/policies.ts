import { generateUUID } from '@/shared/lib/utils';
import { Tables, TablesInsert } from '@/types/db';
import { MSGraphConditionalAccessPolicy } from 'packages/integrations/microsoft/types/conditionalAccess';

export function transformPolicies(
  caPolicies: MSGraphConditionalAccessPolicy[],
  mapping: Tables<'source', 'tenants'>
): TablesInsert<'source', 'policies'>[] {
  return caPolicies.map((policy) => ({
    id: generateUUID(),
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,
    source_tenant_id: mapping.id,

    external_id: policy.id,
    name: policy.displayName,
    type: 'conditional_access',
    status: policy.state === 'enabledForReportingButNotEnforced' ? 'report_only' : policy.state,
    exclusions: getExclusionCount(policy),

    metadata: policy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

const getExclusionCount = (policy: MSGraphConditionalAccessPolicy) => {
  const { users, applications: apps } = policy.conditions;

  return (
    (users?.excludeUsers.length || 0) +
    (users?.excludeRoles.length || 0) +
    (users?.excludeGroups.length || 0) +
    (apps?.excludeApplications.length || 0)
  );
};
