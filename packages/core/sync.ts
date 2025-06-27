import { Tables } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { putSourceSyncJobs } from '@/services/sources';
import { APIResponse } from '@/types';

export async function syncSource(
  integration: Tables<'source_integrations'>,
  siteIds: string[]
): Promise<APIResponse<Tables<'source_sync_jobs'>[]>> {
  try {
    const jobs = await putSourceSyncJobs(
      siteIds.map((s) => {
        return {
          source_id: integration.source_id,
          tenant_id: integration.tenant_id,
          site_id: s,
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
