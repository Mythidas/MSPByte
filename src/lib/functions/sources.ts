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

export async function getIntegrations(): Promise<Tables<'source_integrations'>[]> {
  const supabase = await createClient();
  const integrations = await supabase.from('source_integrations').select();
  return integrations.data || [];
}

export async function getIntegration(id: string): Promise<Tables<'source_integrations'> | null> {
  const supabase = await createClient();
  const integration = await supabase.from('source_integrations').select().eq('id', id).single();
  return integration.data;
}

export async function getIntegrationBySource(id: string): Promise<Tables<'source_integrations'> | null> {
  const supabase = await createClient();
  const integration = await supabase.from('source_integrations').select().eq('source_id', id).single();
  return integration.data;
}

export async function getSiteSourceMappingsBySource(sourceId: string): Promise<Tables<'site_source_mappings'>[]> {
  const supabase = await createClient();
  const mappings = await supabase.from('site_source_mappings').select().eq('source_id', sourceId);
  return mappings.data || [];
}

export async function getSiteSourceMappingsBySite(siteId: string): Promise<Tables<'site_source_mappings'>[]> {
  const supabase = await createClient();
  const mappings = await supabase.from('site_source_mappings').select().eq('site_id', siteId);
  return mappings.data || [];
}

export async function putSiteSourceMapping(mapping: Tables<'site_source_mappings'>) {
  const supabase = await createClient();
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

export async function getSourceDevices(sourceId: string, siteId: string): Promise<Tables<'source_devices'>[]> {
  const supabase = await createClient();
  const devices = await supabase.from('source_devices').select().eq('site_id', siteId).eq('source_id', sourceId);
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

export async function getSourceMetrics(sourceId: string, siteId: string): Promise<Tables<'source_metrics'>[]> {
  const supabase = await createClient();
  const metrics = await supabase.from('source_metrics').select().eq('site_id', siteId).eq('source_id', sourceId);
  return metrics.data || [];
}

export async function putSourceMetric(metric: Tables<'source_metrics'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('source_metrics').insert({
    ...metric,
    id: undefined
  });

  if (error) {
    throw new Error(`Failed to insert metric: ${error.message}`);
  }
}