import { MSGraphRole } from '@/integrations/microsoft/types/roles';
import { generateUUID } from '@/shared/lib/utils';
import { Tables, TablesInsert } from '@/types/db';

export function transformRoles(
  roles: MSGraphRole[],
  mapping: Tables<'source', 'tenants'>
): TablesInsert<'source', 'roles'>[] {
  const filtered = roles.map((role) => {
    if (role.roleTemplateId) return undefined;

    return {
      id: generateUUID(),
      tenant_id: mapping.tenant_id,
      source_id: mapping.source_id,
      site_id: mapping.site_id,
      source_tenant_id: mapping.id,

      external_id: role.id,
      name: role.displayName,
      type: 'security',
      is_default: !!role.roleTemplateId,

      metadata: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  return filtered.filter(Boolean) as TablesInsert<'source', 'roles'>[];
}
