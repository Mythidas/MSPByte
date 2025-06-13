'use server'

import { syncSophosPartner } from "@/lib/actions/server/sources/sophos";
import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getSources(): Promise<ActionResponse<Tables<'sources'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('sources').select('*');

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
      context: 'get-sources',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSource(id?: string, slug?: string): Promise<ActionResponse<Tables<'sources'>>> {
  try {
    if (!id && !slug) {
      throw new Error('getSource requires at least one paramater');
    }

    const supabase = await createClient();

    let query = supabase.from('sources').select('*');
    if (id) query = query.eq('id', id);
    if (slug) query = query.eq('slug', slug);

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
      context: 'get-source',
      message: String(err),
      time: new Date()
    });
  }
}

export async function syncIntegration(integration: Tables<'source_integrations'>): Promise<ActionResponse<null>> {
  try {
    const source = await getSource(integration.source_id);

    if (!source.ok) {
      throw new Error(source.error.message);
    }

    switch (source.data.slug) {
      case 'sophos-partner':
        return await syncSophosPartner(integration);
      default:
        throw new Error('No sync defined for this source');
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-integration',
      message: String(err),
      time: new Date()
    });
  }
}