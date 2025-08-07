'use server';

import { Tables } from '@/db/schema';
import { globalSyncChain } from '@/integrations/autotask/sync/globalSyncChain';
import { siteSyncChain } from '@/integrations/autotask/sync/siteSyncChain';

export async function syncAutoTask(job: Tables<'source_sync_jobs'>) {
  if (!job.source_tenant_id) {
    return globalSyncChain(job);
  } else {
    return siteSyncChain(job);
  }
}
