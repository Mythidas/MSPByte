'use server';

import { syncJob } from '@/core/syncJob';
import { getRow } from '@/db/orm';

export async function testSyncJob(jobId: string) {
  try {
    const job = await getRow('source', 'sync_jobs', {
      filters: [['id', 'eq', jobId]],
    });

    if (!job.ok) throw job.error.message;
    syncJob(job.data);
    return true;
  } catch {
    return false;
  }
}
