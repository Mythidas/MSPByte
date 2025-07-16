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

export async function getSourceMetricsRollupSite(sourceId: string, siteId: string) {
  return tables.select('rollup_metrics_site', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export async function getSourceMetricsRollupParent(sourceId: string, parentId: string) {
  return tables.select('rollup_metrics_parent', (query) => {
    query = query.eq('source_id', sourceId).eq('parent_id', parentId);
  });
}

export async function getSourceMetricsRollupGlobal(sourceId: string) {
  return tables.select('rollup_metrics_global', (query) => {
    query = query.eq('source_id', sourceId);
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
