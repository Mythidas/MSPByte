import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { Tables, TablesInsert } from 'packages/db/schema';

export function transformLicenses(
  licenses: MSGraphSubscribedSku[],
  mapping: Tables<'source_tenants'>,
  licenseInfo: Tables<'source_license_info'>[]
): TablesInsert<'source_licenses'>[] {
  return licenses.map((license) => ({
    tenant_id: mapping.tenant_id,
    source_id: mapping.source_id,
    site_id: mapping.site_id,
    source_tenant_id: mapping.id,
    sync_id: '',

    external_id: license.accountName || license.id || '',
    name:
      licenseInfo.find((lic) => lic.sku === license.skuPartNumber)?.name || license.skuPartNumber,
    sku: license.skuPartNumber,
    status: license.capabilityStatus,
    units: license.prepaidUnits.enabled,
    used_units: license.consumedUnits,

    metadata: license as any,
  }));
}
