'use server';

import { tables } from '../db/index.ts';
import { TablesInsert } from '../db/schema.ts';

export function getSourceLicenses(sourceId?: string, skus?: string[]) {
  return tables.select('source_license_info', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (skus) query = query.in('sku', skus);
  });
}

export function putSourceLicenses(licenses: TablesInsert<'source_license_info'>[]) {
  return tables.insert('source_license_info', licenses);
}

export function deleteSourceLicense(id: string) {
  return tables.delete('source_license_info', [id]);
}
