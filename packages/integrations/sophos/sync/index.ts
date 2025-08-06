'use server';

import { Tables } from '@/db/schema';
import { globalSyncChain } from '@/integrations/sophos/sync/globalSyncChain';
import { siteSyncChain } from '@/integrations/sophos/sync/siteSyncChain';

export async function syncSophosPartner(job: Tables<'source_sync_jobs'>) {
  if (!job.site_id) {
    return globalSyncChain(job);
  } else {
    return siteSyncChain(job);
  }
}
