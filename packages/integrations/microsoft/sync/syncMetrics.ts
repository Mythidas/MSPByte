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
    source_tenant_id: tenant.id,
    name: 'Enabled',
    metric: identities.filter((id) => id.enabled).length,
    total: identities.length,
    created_at: new Date().toISOString(),
  };

  const isInactive = (date: string | number) => {
    const dateA = new Date(date);
    const target = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
    return dateA.getTime() >= target.getTime();
  };
  const licensedIdentities: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    name: 'Inactive',
    metric: identities.filter((id) => isInactive(id.last_activity || 0)).length,
    total: identities.length,
    created_at: new Date().toISOString(),
  };

  const mfaEnabled: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    name: 'Secured',
    metric: identities.filter((id) => id.mfa_enforced && id.enabled).length,
    total: identities.filter((id) => id.enabled).length,
    created_at: new Date().toISOString(),
  };

  const guestUsers: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    name: 'Guests',
    metric: identities.filter((id) => id.type === 'guest').length,
    total: identities.length,
    created_at: new Date().toISOString(),
  };

  try {
    await putSourceMetrics([totalIdentities, licensedIdentities, mfaEnabled, guestUsers]);

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
