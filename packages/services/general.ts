'use server';

import { tables } from '@/db';
import { Database } from '@/db/schema';

export async function deleteRows(table: keyof Database['public']['Tables'], ids: string[]) {
  return tables.delete(table, ids);
}
