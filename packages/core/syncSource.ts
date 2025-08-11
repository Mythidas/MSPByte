import { Tables } from '@/types/db';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { insertRows } from '@/db/orm';

export async function syncSource(
  sourceId: string,
  tenantId: string,
  siteIds: { siteId: string; sourceTenantId: string }[]
): Promise<APIResponse<Tables<'public', 'source_sync_jobs'>[]>> {
  const getEstDuration = () => {
    switch (sourceId) {
      case 'microsoft-365':
        return 30;
      case 'sophos-partner':
        return 20;
      default:
        return 30;
    }
  };

  try {
    const jobs = await insertRows('public', 'source_sync_jobs', {
      rows: siteIds.map((s) => {
        return {
          source_id: sourceId,
          tenant_id: tenantId,
          source_tenant_id: s.sourceTenantId,
          est_duration: getEstDuration(),
          site_id: s.siteId,
          created_at: new Date().toISOString(),
        };
      }),
    });

    if (!jobs.ok) {
      throw new Error(jobs.error.message);
    }

    return {
      ok: true,
      data: jobs.data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'syncSource',
      message: String(err),
      time: new Date(),
    });
  }
}
