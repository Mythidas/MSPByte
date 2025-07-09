'use server';

import { APIResponse } from '@/types';
import { tables } from '@/db';
import { TablesInsert, TablesUpdate } from '@/db/schema';

export async function getSourceMetrics(sourceId: string, siteIds?: string[]) {
  return tables.select('source_metrics', (query) => {
    query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceMetricsRollup(
  scope: 'site' | 'parent' | 'global',
  sourceId: string,
  siteId?: string
) {
  return tables.rpc('get_rollup_metrics', {
    _scope: scope,
    _id: siteId || '',
    _source_id: sourceId,
  });
}

export async function putSourceMetrics(metrics: TablesInsert<'source_metrics'>[]) {
  return tables.insert('source_metrics', metrics);
}

export async function updateSourceMetric(id: string, metric: TablesUpdate<'source_metrics'>) {
  return tables.update('source_metrics', id, metric);
}

export async function upsertSourceMetric(rows: TablesUpdate<'source_metrics'>[]) {
  return tables.upsert('source_metrics', rows);
}

export async function deleteSourceMetrics(ids: string[]): Promise<APIResponse<null>> {
  return tables.delete('source_metrics', ids);
}
