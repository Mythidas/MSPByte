'use server';

import { tables } from '@/db';
import { TablesInsert } from '@/types/db';

export async function putSite(sites: TablesInsert<'public', 'sites'>[]) {
  return tables.insert('public', 'sites', sites);
}
