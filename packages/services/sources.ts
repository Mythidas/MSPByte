'use server';

import { TablesInsert } from '@/db/schema';
import { PaginationOptions } from '@/types/data-table';
import { tables } from 'packages/db';

export async function getSources(pagination?: PaginationOptions) {
  return tables.select('sources', undefined, pagination);
}

export async function getSource(id?: string) {
  return tables.selectSingle('sources', (query) => {
    if (id) query = query.eq('id', id);
  });
}

export async function putSourceSyncJobs(jobs: TablesInsert<'source_sync_jobs'>[]) {
  return tables.insert('source_sync_jobs', jobs);
}
