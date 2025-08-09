'use server';

import { Tables } from '@/types/db';
import { globalSyncChain } from '@/integrations/microsoft/sync/globalSyncChain';
import { siteSyncChain } from '@/integrations/microsoft/sync/siteSyncChain';

export async function syncMicrosoft365(job: Tables<'source', 'sync_jobs'>) {
  if (!job.site_id) {
    return globalSyncChain(job);
  } else {
    return siteSyncChain(job);
  }
}
