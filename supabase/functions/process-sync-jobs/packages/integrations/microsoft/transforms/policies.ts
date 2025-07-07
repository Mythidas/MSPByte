import { Tables, TablesInsert } from '../../../db/schema.ts';
import { MSGraphConditionalAccessPolicy } from '../types/conditionalAccess.ts';

export function transformPolicies(
  caPolicies: MSGraphConditionalAccessPolicy[],
  mapping: Tables<'source_tenants'>
): TablesInsert<'source_policies'>[] {
  return caPolicies.map((policy) => ({
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,

    external_id: policy.id,
    name: policy.displayName,
    type: 'conditional_access',
    status: policy.state,
    metadata: policy,
    created_at: policy.createdDateTime,
  }));
}
