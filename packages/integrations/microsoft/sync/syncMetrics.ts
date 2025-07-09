import { Tables, TablesInsert } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { putSourceMetrics } from '@/services/source/metrics';
import { APIResponse } from '@/types';

export async function syncMetrics(
  tenant: Tables<'source_tenants'>,
  _policies: Tables<'source_policies'>[],
  _licenses: Tables<'source_license_info'>[],
  identities: Tables<'source_identities'>[]
): Promise<APIResponse<null>> {
  const totalIdentities: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    name: 'Total Identities',
    unit: 'identities',
    metric: identities.length,
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: { tab: 'identities' },
    description: 'Active Microsoft 365 users',
    visual: null,
    thresholds: null,
    created_at: new Date().toISOString(),
  };

  const licensedIdentities: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    name: 'Licensed Identities',
    unit: 'identities',
    metric: identities.filter((id) => id.license_skus.length > 0).length,
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: { tab: 'identities' },
    description: 'Users with active licenses',
    visual: null,
    thresholds: null,
    created_at: new Date().toISOString(),
  };

  const mfaEnabled: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    name: 'MFA Enabled',
    unit: 'identities',
    metric: identities.filter((id) => id.mfa_enforced).length,
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: {
      tab: 'identities',
      filter: 'mfa_enforced+eq+true+and+enabled+eq+true+and+type+eq+member',
    },
    description: 'Users with MFA enforced',
    visual: 'percentage',
    thresholds: null,
    created_at: new Date().toISOString(),
  };

  try {
    await putSourceMetrics([totalIdentities, licensedIdentities, mfaEnabled]);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncMetrics',
      message: String(err),
      time: new Date(),
    });
  }
}
