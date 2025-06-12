'use server'

import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getSources(): Promise<Tables<'sources'>[]> {
  const supabase = await createClient();
  const sources = await supabase.from('sources').select();
  return sources.data || [];
}

export async function getSourceBySlug(slug: string): Promise<Tables<'sources'> | null> {
  const supabase = await createClient();
  const source = await supabase.from('sources').select().eq('slug', slug).single();
  return source.data;
}

export async function getIntegrations(): Promise<Tables<'source_integrations_view'>[]> {
  const supabase = await createClient();
  const integrations = await supabase.from('source_integrations_view').select();
  return integrations.data || [];
}

export async function getIntegration(id: string): Promise<Tables<'source_integrations_view'> | null> {
  const supabase = await createClient();
  const integration = await supabase.from('source_integrations_view').select().eq('id', id).single();
  return integration.data;
}

export async function getIntegrationBySource(id: string): Promise<Tables<'source_integrations_view'> | null> {
  const supabase = await createClient();
  const integration = await supabase.from('source_integrations_view').select().eq('source_id', id).single();
  return integration.data;
}

export async function getSiteSourceMappings(sourceId?: string, siteId?: string): Promise<Tables<'site_source_mappings'>[]> {
  const supabase = await createClient();

  let query = supabase.from('site_source_mappings').select();
  if (sourceId) query = query.eq('source_id', sourceId);
  if (siteId) query = query.eq('site_id', siteId);

  const mappings = await query;
  return mappings.data || [];
}

export async function getSiteMappingsView(sourceId?: string) {
  const supabase = await createClient();

  let query = supabase.from('site_mappings_view').select();

  if (sourceId) {
    query = query.or(`source_id.eq.${sourceId},source_id.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching mappings:', error);
    return [];
  }

  return data || [];
}


export async function putSiteSourceMapping(mapping: Tables<'site_source_mappings'>) {
  const supabase = await createClient();
  const data = await getSiteSourceMappings(mapping.source_id, mapping.site_id);
  if (data.length === 1) {
    const { error } = await supabase.from('site_source_mappings').update({
      external_id: mapping.external_id,
      external_name: mapping.external_name,
      metadata: mapping.metadata || {},
    }).eq('id', data[0].id);

    if (error) {
      throw new Error(`Failed to insert mapping: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase.from('site_source_mappings').insert({
    tenant_id: mapping.tenant_id,
    site_id: mapping.site_id,
    external_id: mapping.external_id,
    external_name: mapping.external_name,
    metadata: mapping.metadata || {},
    source_id: mapping.source_id
  });
  if (error) {
    throw new Error(`Failed to insert mapping: ${error.message}`);
  }
}

export async function getSourceDevices(sourceId?: string, siteId?: string): Promise<Tables<'source_devices_view'>[]> {
  const supabase = await createClient();
  let query = supabase.from('source_devices_view').select();
  if (sourceId) query = query.eq('source_id', sourceId);
  if (siteId) query = query.eq('site_id', siteId);

  const devices = await query;
  return devices.data || [];
}

export async function putSourceDevice(device: Tables<'source_devices'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('source_devices').insert({
    ...device,
    id: undefined
  });

  if (error) {
    throw new Error(`Failed to insert device: ${error.message}`);
  }
}

export async function updateSourceDevice(device: Tables<'source_devices'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('source_devices').update({
    ...device
  }).eq('id', device.id);

  if (error) {
    throw new Error(`Failed to update device: ${error.message}`);
  }
}

export async function deleteSourceDevice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('source_devices').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete device: ${error.message}`);
  }
}

export async function getSourceMetrics(sourceId: string, siteId?: string): Promise<Tables<'source_metrics'>[]> {
  const supabase = await createClient();
  let query = supabase.from('source_metrics_newest').select().eq('source_id', sourceId);
  if (siteId) {
    query = query.eq('site_id', siteId);
  }
  const metrics = await query;
  return (metrics.data as Tables<'source_metrics'>[]) || [];
}

export async function getSourceMetricsAggregated(sourceId: string): Promise<Tables<'source_metrics'>[]> {
  const supabase = await createClient();
  let query = supabase.from('source_metrics_aggregated').select().eq('source_id', sourceId);
  const metrics = await query;
  return (metrics.data as Tables<'source_metrics'>[]) || [];
}

export async function putSourceMetric(metric: Tables<'source_metrics'>) {
  const supabase = await createClient();

  const { data } = await supabase.from('source_metrics')
    .select()
    .eq('name', metric.name)
    .eq('source_id', metric.source_id)
    .eq('site_id', metric.site_id)
    .order('created_at', { ascending: false })
    .single();

  if (data) {
    const createdAt = new Date(data.created_at!);
    if (createdAt && (Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000)) {
      updateSourceMetric({ ...metric, id: data.id });
      return;
    }
  }

  const { error } = await supabase.from('source_metrics').insert({
    ...metric,
    id: undefined,
    created_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(`Failed to insert metric: ${error.message}`);
  }
}

export async function updateSourceMetric(metric: Tables<'source_metrics'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('source_metrics').update({
    ...metric,
  }).eq('id', metric.id);

  if (error) {
    throw new Error(`Failed to insert metric: ${error.message}`);
  }
}