import { Tables } from '@/types/db';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { insertRows } from '@/db/orm';

export async function syncSource(
  sourceId: string,
  tenantId: string,
  siteIds: { siteId: string; sourceTenantId: string }[]
): Promise<APIResponse<Tables<'source', 'sync_jobs'>[]>> {
  const getEstDuration = () => {
    switch (sourceId) {
      case 'microsoft-365':
        return 30;
      case 'sophos-partner':
        return 20;
      default:
        return 0;
    }
  };

  try {
    if (getEstDuration() === 0) throw 'Source does not support site level syncing';

    const jobs = await insertRows('source', 'sync_jobs', {
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

    if (jobs.error) {
      throw new Error(jobs.error.message);
    }

    return {
      data: jobs.data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'syncSource',
      message: String(err),
    });
  }
}
