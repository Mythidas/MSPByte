'use server';

import { APIResponse } from '@/types';
import { tables } from '@/db';
import { TablesInsert, TablesUpdate } from '@/types/db';

export async function getSourceMetrics(sourceId: string, siteIds?: string[]) {
  return tables.select('source', 'metrics', (query) => {
    query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceMetricsRollupSite(sourceId: string, siteId: string) {
  return tables.select('source', 'metrics_rollup_site', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export async function getSourceMetricsRollupParent(sourceId: string, parentId: string) {
  return tables.select('source', 'metrics_rollup_parent', (query) => {
    query = query.eq('source_id', sourceId).eq('parent_id', parentId);
  });
}

export async function getSourceMetricsRollupGlobal(sourceId: string) {
  return tables.select('source', 'metrics_rollup_global', (query) => {
    query = query.eq('source_id', sourceId);
  });
}

export async function putSourceMetrics(metrics: TablesInsert<'source', 'metrics'>[]) {
  return tables.insert('source', 'metrics', metrics);
}

export async function updateSourceMetric(id: string, metric: TablesUpdate<'source', 'metrics'>) {
  return tables.update('source', 'metrics', id, metric);
}

export async function upsertSourceMetric(rows: TablesUpdate<'source', 'metrics'>[]) {
  return tables.upsert('source', 'metrics', rows);
}

export async function deleteSourceMetrics(ids: string[]): Promise<APIResponse<null>> {
  return tables.delete('source', 'metrics', (query) => {
    query = query.in('id', ids);
  });
}
