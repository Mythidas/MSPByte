'use server';

import { tables } from '@/db';
import { TablesUpdate } from '@/db/schema';

export async function updateSite(id: string, row: TablesUpdate<'sites'>) {
  return tables.update('sites', id, row);
}
