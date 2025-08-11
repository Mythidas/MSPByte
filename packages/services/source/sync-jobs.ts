'use server';

import { tables } from '@/db';

export async function getSourceSyncJobLatest(sourceId: string, siteId: string) {
  return tables.selectSingle('public', 'source_sync_jobs', (query) => {
    query = query
      .eq('source_id', sourceId)
      .eq('site_id', siteId)
      .order('started_at', { ascending: false })
      .limit(1);
  });
}
