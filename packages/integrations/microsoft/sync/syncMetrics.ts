import { Debug } from '@/lib/utils';
import { Tables, TablesInsert } from 'packages/db/schema';
import { APIResponse } from '@/types';

export async function syncMetrics(
  mapping: Tables<'site_source_mappings'>,
  policies: Tables<'source_policies'>[],
  licenses: Tables<'source_licenses'>[],
  identities: Tables<'source_identities'>[]
): Promise<APIResponse<null>> {
  const totalIdentities: TablesInsert<'source_metrics'> = {
    id: '',
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
    id: '',
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    source_id: mapping.source_id,
    name: 'No MFA Enforced',
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

  try {
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
