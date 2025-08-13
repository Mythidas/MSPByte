'use server';

import { Debug } from '@/lib/utils';
import { tables } from 'packages/db';
import { TablesInsert } from '@/types/db';

export async function getSourceLicenses(sourceId?: string, skus?: string[], siteIds?: string[]) {
  if (!siteIds) {
    return tables.select('source', 'license_info', (query) => {
      query = query.order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (skus) query = query.in('sku', skus);
    });
  }

  try {
    const identities = await tables.select('source', 'identities', (query) => {
      query = query.order('site_id').order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    });

    if (identities.error) throw identities.error.message;

    const skuSet = new Set<string>();
    for (const identity of identities.data.rows) {
      for (const sku of identity.license_skus) {
        skuSet.add(sku);
      }
    }

    return tables.select('source', 'license_info', (query) => {
      query = query.order('name');
      query = query.in('sku', Array.from(skuSet));
      if (sourceId) query = query.eq('source_id', sourceId);
    });
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_source_licenses`,
      message: String(err),
    });
  }
}
