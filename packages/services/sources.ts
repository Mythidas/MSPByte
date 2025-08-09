'use server';

import { TablesInsert } from '@/types/db';
import { PaginationOptions } from '@/types/db';
import { tables } from 'packages/db';

export async function getSources(pagination?: PaginationOptions) {
  return tables.select('public', 'sources', undefined, pagination);
}

export async function getSource(id?: string) {
  return tables.selectSingle('public', 'sources', (query) => {
    if (id) query = query.eq('id', id);
  });
}

export async function putSourceSyncJobs(jobs: TablesInsert<'source', 'sync_jobs'>[]) {
  return tables.insert('source', 'sync_jobs', jobs);
}
