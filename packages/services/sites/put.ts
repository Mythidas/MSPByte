'use server';

import { tables } from '@/db';
import { TablesInsert } from '@/db/schema';

export async function putSite(sites: TablesInsert<'sites'>[]) {
  return tables.insert('sites', sites);
}
