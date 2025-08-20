import { Tables, TablesInsert } from '@/types/db';
import { generateUUID } from '@/shared/lib/utils';
import { SPTenant } from '@/integrations/sophos/types/tenant';

export function transformSites(
  integration: Tables<'public', 'integrations'>,
  tenants: SPTenant[]
): TablesInsert<'source', 'sites'>[] {
  return tenants.map((tenant) => {
    return {
      id: generateUUID(),
      tenant_id: integration.tenant_id,
      source_id: integration.source_id,

      external_id: tenant.id,
      name: tenant.name,
      enabled: true,

      metadata: tenant,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as TablesInsert<'source', 'sites'>;
  });
}
