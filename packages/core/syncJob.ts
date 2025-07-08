import { Tables } from '@/db/schema';
import { syncMicrosoft365 } from '@/integrations/microsoft/sync';
import { syncSophosPartner } from '@/integrations/sophos/sync';
import { Debug } from '@/lib/utils';
import { getSourceIntegration } from '@/services/integrations';
import { getSource } from '@/services/sources';
import { APIResponse } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function syncJob(job: Tables<'source_sync_jobs'>, supabase: SupabaseClient) {
  try {
    const integration = await getSourceIntegration(undefined, job.source_id!);
    const source = await getSource(job.source_id!);

    if (!source.ok || !integration.ok) {
      throw new Error('Failed to fetch from db');
    }

    switch (source.data.id) {
      case 'sophos-partner': {
        const result = await syncSophosPartner(integration.data, job.site_id);
        if (result.ok) {
          await supabase
            .from('source_sync_jobs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          break;
        } else throw result.error.message;
      }
      case 'microsoft-365': {
        const result = await syncMicrosoft365(integration.data, job.site_id);
        if (result.ok) {
          await supabase
            .from('source_sync_jobs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
          break;
        } else throw result.error.message;
      }
      default:
        throw new Error('No sync defined for this source');
    }
  } catch (err: unknown) {
    await supabase
      .from('source_sync_jobs')
      .update({
        status: 'failed',
        error: String(err),
        retry_count: (job.retry_count ?? 0) + 1,
        last_attemt_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return Debug.error({
      module: 'Integrations',
      context: 'syncJob',
      message: String(err),
      time: new Date(),
    });
  }
}
