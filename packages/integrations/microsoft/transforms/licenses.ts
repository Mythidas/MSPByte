import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { Tables, TablesInsert } from 'packages/db/schema';

export function transformLicenses(
  licenses: MSGraphSubscribedSku[],
  mapping: Tables<'source_tenants'>
): TablesInsert<'source_licenses'>[] {
  return licenses.map((license) => ({
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,
    source_tenant_id: mapping.id,
    sync_id: '',

    external_id: license.id,
    name: license.skuPartNumber,
    sku: license.skuId,
    status: 'active',
    units: license.consumedUnits,

    metadata: license as any,
  }));
}
