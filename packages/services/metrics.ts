'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Schema } from 'packages/db';
import { createClient } from 'packages/db/server';
import { Tables } from 'packages/db/schema';

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

export async function getSourceMetricsAggregatedGrouped(
  sourceId: string,
  parentId: string
): Promise<APIResponse<Tables<'source_metrics_aggregated_grouped'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('source_metrics_aggregated_grouped')
      .select()
      .eq('source_id', sourceId)
      .eq('parent_id', parentId);

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

export async function putSourceMetric(
  metric: Tables<'source_metrics'>
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('source_metrics')
      .select()
      .eq('name', metric.name)
      .eq('source_id', metric.source_id)
      .eq('site_id', metric.site_id)
      .order('created_at', { ascending: false })
      .single();

    if (data) {
      if (metric.is_historic) {
        const createdAt = new Date(data.created_at!);
        if (createdAt && Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000) {
          return await updateSourceMetric({ ...metric, id: data.id });
        }
      } else {
        return await updateSourceMetric({
          ...metric,
          id: data.id,
          created_at: new Date().toISOString(),
        });
      }
    }

    const { error } = await supabase.from('source_metrics').insert({
      ...metric,
      id: undefined,
      created_at: new Date().toISOString(),
    });

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
