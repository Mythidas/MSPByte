'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { tables } from 'packages/db';
import { createClient } from 'packages/db/server';
import { Tables, TablesInsert } from 'packages/db/schema';

export async function getSourceMetrics(
  sourceId: string,
  siteIds?: string[]
): Promise<APIResponse<Tables<'source_metrics'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('source_metrics').select().eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-source-metrics',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getSourceMetricsAggregated(
  sourceId: string
): Promise<APIResponse<Tables<'source_metrics_aggregated'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('source_metrics_aggregated').select().eq('source_id', sourceId);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-source-metrics-aggregated',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getSourceMetricsAggregatedGrouped(sourceId: string, parentId: string) {
  return tables.select('source_metrics_aggregated_grouped', (query) => {
    query = query.eq('source_id', sourceId).eq('parent_id', parentId);
  });
}

export async function putSourceMetrics(
  metrics: TablesInsert<'source_metrics'>[]
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('source_metrics').insert(metrics);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'put-source-metric',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function updateSourceMetric(
  metric: Tables<'source_metrics'>
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('source_metrics')
      .update({
        ...metric,
      })
      .eq('id', metric.id);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'update-source-metric',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function deleteSourceMetric(id: string): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('source_metrics').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'update-source-metric',
      message: String(err),
      time: new Date(),
    });
  }
}
