'use server';

import { Tables } from '@/types/db';
import { createClient } from '@/db/server';
import { syncAutoTask } from '@/integrations/autotask/sync';
import { syncMicrosoft365 } from '@/integrations/microsoft/sync';
import { syncSophosPartner } from '@/integrations/sophos/sync';
import { Debug } from '@/lib/utils';

export async function syncJob(job: Tables<'public', 'source_sync_jobs'>) {
  const supabase = await createClient();
  try {
    switch (job.source_id) {
      case 'sophos-partner': {
        await syncSophosPartner(job);
        break;
      }
      case 'microsoft-365': {
        await syncMicrosoft365(job);
        break;
      }
      case 'autotask': {
        await syncAutoTask(job);
        break;
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
        retry_count: job.retry_count + 1,
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
