'use server';

import { tables } from 'packages/db';
import { TablesInsert } from 'packages/db/schema';

export async function getSourceLicenses(sourceId?: string, skus?: string[]) {
  return await tables.select('source_licenses', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (skus) query = query.in('sku', skus);
  });
}

export async function putSourceLicenses(licenses: TablesInsert<'source_licenses'>[]) {
  return await tables.insert('source_licenses', licenses);
}

export async function deleteSourceLicense(id: string) {
  return await tables.delete('source_licenses', [id]);
}
