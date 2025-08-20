import { Tables, TablesInsert } from '@/types/db';
import { generateUUID } from '@/shared/lib/utils';
import { SPFirewallLicense } from '@/integrations/sophos/types/license';

export function transformLicenses(
  integration: Tables<'public', 'integrations'>,
  tenants: Tables<'source', 'tenants'>[],
  firewallLicenses: SPFirewallLicense[]
): TablesInsert<'source', 'licenses'>[] {
  const licenses: TablesInsert<'source', 'licenses'>[] = [];
  for (const fwl of firewallLicenses) {
    const tenant = tenants.find((tenant) => tenant.external_id === fwl.billingTenant.id);

    for (const lic of fwl.licenses) {
      licenses.push({
        id: generateUUID(),
        tenant_id: integration.tenant_id,
        source_id: integration.source_id,
        site_id: tenant?.site_id || null,
        source_tenant_id: tenant?.id || null,

        external_id: lic.id,
        name: lic.product.name,
        sku: lic.product.genericCode,
        status: '',
        units: lic.quantity,

        metadata: {
          model: fwl.model,
          modelType: fwl.modelType,
          lastSeenAt: fwl.lastSeenAt,
          serialNumber: fwl.serialNumber,
          ...lic,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return licenses;
}
