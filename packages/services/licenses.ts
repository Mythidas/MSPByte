'use server';

import { tables } from 'packages/db';
import { TablesInsert } from 'packages/db/schema';

export async function getSourceLicenses(sourceId?: string, skus?: string[]) {
  return await tables.select('source_license_info', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (skus) query = query.in('sku', skus);
  });
}

export async function putSourceLicenses(licenses: TablesInsert<'source_license_info'>[]) {
  return await tables.insert('source_license_info', licenses);
}

export async function deleteSourceLicense(id: string) {
  return await tables.delete('source_license_info', [id]);
}
