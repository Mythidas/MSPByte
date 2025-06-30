'use server';

import { tables } from '../db/index.ts';
import { TablesInsert } from '../db/schema.ts';

export function getSourceMetrics(sourceId: string, siteIds?: string[]) {
  return tables.select('source_metrics', (query) => {
    query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export function putSourceMetrics(metrics: TablesInsert<'source_metrics'>[]) {
  return tables.insert('source_metrics', metrics);
}

export function deleteSourceMetrics(ids: string[]) {
  return tables.delete('source_metrics', ids);
}
