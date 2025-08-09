'use server';

import { tables } from '@/db';

export async function deleteSites(ids: string[]) {
  return tables.delete('public', 'sites', (query) => {
    query = query.in('id', ids);
  });
}
