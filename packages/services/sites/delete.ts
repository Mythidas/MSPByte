'use server';

import { tables } from '@/db';

export async function deleteSites(ids: string[]) {
  return tables.delete('sites', ids);
}
