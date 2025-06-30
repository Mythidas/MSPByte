import { APIResponse, Debug } from '../../utils.ts';
import { Tables } from '../db/schema.ts';
import { syncMicrosoft365 } from '../integrations/microsoft/sync/index.ts';
import { syncSophosPartner } from '../integrations/sophos/sync/index.ts';
import { getSourceIntegration } from '../services/integrations.ts';
import { getSource } from '../services/sources.ts';

export async function syncJob(job: Tables<'source_sync_jobs'>): Promise<APIResponse<null>> {
  try {
    const integration = await getSourceIntegration(undefined, job.source_id!);
    const source = await getSource(job.source_id!);

    if (!source.ok || !integration.ok) {
      throw new Error('Failed to fetch from db');
    }

    switch (source.data.id) {
      case 'sophos-partner':
        return await syncSophosPartner(integration.data, job.site_id);
      case 'microsoft-365':
        return await syncMicrosoft365(integration.data, job.site_id);
      default:
        throw new Error('No sync defined for this source');
    }
  } catch (err) {
    return Debug.error({
      module: 'Integrations',
      context: 'syncJob',
      message: String(err),
      time: new Date(),
    });
  }
}
