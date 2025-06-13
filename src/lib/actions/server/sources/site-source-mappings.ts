'use server'

import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getSiteMappings(sourceId?: string): Promise<ActionResponse<Tables<'site_mappings_view'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('site_mappings_view').select();
    if (sourceId) {
      query = query.or(`source_id.eq.${sourceId},source_id.is.null`);
    }

    const { data, error } = await query;

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-site-mappings',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSiteMapping(id: string): Promise<ActionResponse<Tables<'site_mappings_view'>>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('site_mappings_view').select('*').eq('id', id);

    const { data, error } = await query.single();

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-site-source-mappings',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSiteSourceMappings(sourceId?: string, siteId?: string): Promise<ActionResponse<Tables<'site_source_mappings'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('site_source_mappings').select('*');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteId) query = query.eq('site_id', siteId);

    const { data, error } = await query;

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-site-source-mappings',
      message: String(err),
      time: new Date()
    });
  }
}

export async function putSiteSourceMapping(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<null>> {
  try {
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
      throw new Error(error.message);
    }

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'put-site-source-mapping',
      message: String(err),
      time: new Date()
    })
  }
}