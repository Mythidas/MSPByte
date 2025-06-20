'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Schema } from 'packages/db';
import { createClient } from 'packages/db/server';
import { Tables } from 'packages/db/schema';

export async function getIntegrations(): Promise<APIResponse<Tables<'source_integrations'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('source_integrations').select('*');

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-integrations',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getIntegrationsView(): Promise<
  APIResponse<Tables<'source_integrations_view'>[]>
> {
  try {
    const supabase = await createClient();

    let query = supabase.from('source_integrations_view').select('*');

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-integrations',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getIntegration(
  id?: string,
  sourceId?: string
): Promise<APIResponse<Tables<'source_integrations'>>> {
  try {
    const supabase = await createClient();

    if (!id && !sourceId) {
      throw new Error('getIntegration requires at least one id');
    }

    let query = supabase.from('source_integrations').select('*');
    if (id) query = query.eq('id', id);
    if (sourceId) query = query.eq('source_id', sourceId);

    const { data, error } = await query.single();

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-integration',
      message: String(err),
      time: new Date(),
    });
  }
}
