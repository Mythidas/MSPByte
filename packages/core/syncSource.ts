import { Tables } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { putSourceSyncJobs } from '@/services/sources';
import { APIResponse } from '@/types';

export async function syncSource(
  sourceId: string,
  tenantId: string,
  siteIds: { siteId: string; sourceTenantId: string }[]
): Promise<APIResponse<Tables<'source_sync_jobs'>[]>> {
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
    const jobs = await putSourceSyncJobs(
      siteIds.map((s) => {
        return {
          source_id: sourceId,
          tenant_id: tenantId,
          source_tenant_id: s.sourceTenantId,
          est_duration: getEstDuration(),
          site_id: s.siteId,
          created_at: new Date().toISOString(),
        };
      })
    );

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
