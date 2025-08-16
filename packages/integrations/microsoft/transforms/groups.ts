import { MSGraphGroup } from '@/integrations/microsoft/types/groups';
import { generateUUID } from '@/shared/lib/utils';
import { Tables, TablesInsert } from '@/types/db';

export function transformGroups(
  groups: MSGraphGroup[],
  mapping: Tables<'source', 'tenants'>
): TablesInsert<'source', 'groups'>[] {
  return groups.map((group) => ({
    id: generateUUID(),
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,
    source_tenant_id: mapping.id,

    external_id: group.id,
    name: group.displayName,
    type: 'security',
    is_default: false,

    metadata: group,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
