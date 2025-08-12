import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { generateUUID } from '@/lib/utils';
import { Tables, TablesInsert } from '@/types/db';

export function transformLicenses(
  licenses: MSGraphSubscribedSku[],
  mapping: Tables<'source', 'tenants'>,
  licenseInfo: Tables<'source', 'license_info'>[]
): TablesInsert<'source', 'licenses'>[] {
  return licenses.map((license) => ({
    id: generateUUID(),
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,
    source_tenant_id: mapping.id,
    sync_id: '',

    external_id: license.skuId || '',
    name:
      licenseInfo.find((lic) => lic.sku === license.skuPartNumber)?.name || license.skuPartNumber,
    sku: license.skuPartNumber,
    status: license.capabilityStatus,
    units: license.prepaidUnits.enabled,
    used_units: license.consumedUnits,

    metadata: license as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
