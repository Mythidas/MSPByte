import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables, TablesInsert } from '../../../db/schema.ts';
import {
  deleteSourceMetrics,
  getSourceMetrics,
  putSourceMetrics,
} from '../../../services/metrics.ts';

export async function syncMetrics(
  mapping: Tables<'site_source_mappings'>,
  _policies: Tables<'source_policies'>[],
  _licenses: Tables<'source_license_info'>[],
  identities: Tables<'source_identities'>[]
): Promise<APIResponse<null>> {
  const metrics = await getSourceMetrics(mapping.source_id, [mapping.site_id]);
  if (metrics.ok) {
    await deleteSourceMetrics(metrics.data.map((m) => m.id));
  }

  const totalIdentities: TablesInsert<'source_metrics'> = {
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'Total Identities',
    metric: identities.length,
    unit: 'identities',
    total: null,
    route: '/sources/microsoft-365',
    filters: { tab: 'identities' },
    metadata: {},
    is_historic: false,
    visual: null,
    thresholds: null,
    created_at: new Date().toISOString(),
  };

  const mfaEnforcedMetric: TablesInsert<'source_metrics'> = {
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'No MFA Enforced (Member)',
    metric: identities.filter((id) => !id.mfa_enforced && id.enabled && id.type === 'member')
      .length,
    unit: 'identities',
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: {
      tab: 'identities',
      filter: 'mfa_enforced+eq+false+and+enable+eq+true+and+type+eq+member',
    },
    metadata: {},
    is_historic: false,
    visual: 'progress',
    thresholds: { info: 0, warn: 30, crticial: 60, highest: false },
    created_at: new Date().toISOString(),
  };

  const mfaEnforcedMetricGuest: TablesInsert<'source_metrics'> = {
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'No MFA Enforced (Guest)',
    metric: identities.filter((id) => !id.mfa_enforced && id.enabled && id.type === 'guest').length,
    unit: 'identities',
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: {
      tab: 'identities',
      filter: 'mfa_enforced+eq+false+and+enable+eq+true+and+type+eq+guest',
    },
    metadata: {},
    is_historic: false,
    visual: 'progress',
    thresholds: { info: 0, warn: 30, crticial: 60, highest: false },
    created_at: new Date().toISOString(),
  };

  const disabledAccountsMetric: TablesInsert<'source_metrics'> = {
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'Disabled Accounts',
    metric: identities.filter((id) => !id.enabled).length,
    unit: 'identities',
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: { tab: 'identities', filter: 'enabled+eq+false' },
    metadata: {},
    is_historic: false,
    visual: 'progress',
    thresholds: null,
    created_at: new Date().toISOString(),
  };

  const sixtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 60;
  const inactiveAccounts: TablesInsert<'source_metrics'> = {
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'Inactive Accounts (60 Days)',
    metric: identities.filter((id) => {
      if (!id.last_activity) return false;
      const lastActive = new Date(id.last_activity).getTime();
      return !lastActive || lastActive < sixtyDaysAgo;
    }).length,
    unit: 'identities',
    total: identities.length,
    route: '/sources/microsoft-365',
    filters: { tab: 'identities', filter: 'last_activity+gt+60' },
    metadata: {},
    is_historic: false,
    visual: 'progress',
    thresholds: { info: 10, warn: 30, crticial: 50, highest: false },
    created_at: new Date().toISOString(),
  };

  try {
    await putSourceMetrics([
      totalIdentities,
      mfaEnforcedMetric,
      mfaEnforcedMetricGuest,
      disabledAccountsMetric,
      inactiveAccounts,
    ]);

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
