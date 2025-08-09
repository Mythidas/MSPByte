'use server';

import { tables } from '@/db';
import { TablesUpdate } from '@/types/db';

export async function updateSite(id: string, row: TablesUpdate<'public', 'sites'>) {
  return tables.update('public', 'sites', id, row);
}
