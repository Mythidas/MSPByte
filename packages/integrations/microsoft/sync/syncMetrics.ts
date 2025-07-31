import { insertRows } from '@/db/orm';
import { Tables, TablesInsert } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { MicrosoftIdentityMetadata } from '@/types/source/identities';

export async function syncMetrics(
  tenant: Tables<'source_tenants'>,
  identities: Tables<'source_identities'>[]
): Promise<APIResponse<null>> {
  // Identities
  const enabledUsers = identities.filter((id) => id.enabled);
  const totalIdentities: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    definition_id: 'bfyqylqz',
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
    definition_id: 'ug1r6e4z',
    metric: identities.filter((id) => isInactive(id.last_activity_at || 0)).length,
    total: identities.length,
    created_at: new Date().toISOString(),
  };

  const mfaEnabled: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    definition_id: 'h2da764z',
    metric: enabledUsers.filter((id) => id.mfa_enforced).length,
    total: enabledUsers.length,
    created_at: new Date().toISOString(),
  };

  const guestUsers: TablesInsert<'source_metrics'> = {
    site_id: tenant.site_id,
    tenant_id: tenant.tenant_id,
    source_id: tenant.source_id,
    source_tenant_id: tenant.id,
    definition_id: 'mgclj74z',
    metric: enabledUsers.filter(
      (id) => (id.metadata as MicrosoftIdentityMetadata).valid_mfa_license
    ).length,
    total: enabledUsers.length,
    created_at: new Date().toISOString(),
  };

  try {
    await insertRows('source_metrics', {
      rows: [totalIdentities, licensedIdentities, mfaEnabled, guestUsers],
    });

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
