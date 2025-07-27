'use server';

import { Debug } from '@/lib/utils';
import { tables } from 'packages/db';
import { TablesInsert } from 'packages/db/schema';

export async function getSourceLicenses(sourceId?: string, skus?: string[], siteIds?: string[]) {
  if (!siteIds) {
    return tables.select('source_license_info', (query) => {
      query = query.order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (skus) query = query.in('sku', skus);
    });
  }

  try {
    const identities = await tables.select('source_identities', (query) => {
      query = query.order('site_id').order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    });

    if (!identities.ok) throw identities.error.message;

    const skuSet = new Set<string>();
    for (const identity of identities.data.rows) {
      for (const sku of identity.license_skus) {
        skuSet.add(sku);
      }
    }

    return tables.select('source_license_info', (query) => {
      query = query.order('name');
      query = query.in('sku', Array.from(skuSet));
      if (sourceId) query = query.eq('source_id', sourceId);
    });
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_source_licenses`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function putSourceLicenses(licenses: TablesInsert<'source_license_info'>[]) {
  return tables.insert('source_license_info', licenses);
}

export async function deleteSourceLicense(id: string) {
  return tables.delete('source_license_info', (query) => {
    query = query.eq('id', id);
  });
}
