'use server';

import { Tables } from '@/types/db';
import { globalSyncChain } from '@/integrations/autotask/sync/globalSyncChain';
import { siteSyncChain } from '@/integrations/autotask/sync/siteSyncChain';

export async function syncAutoTask(job: Tables<'public', 'source_sync_jobs'>) {
  if (!job.source_tenant_id) {
    return globalSyncChain(job);
  } else {
    return siteSyncChain(job);
  }
}
