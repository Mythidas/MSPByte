'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { tables } from 'packages/db';
import { createClient } from 'packages/db/server';
import { Tables, TablesInsert } from 'packages/db/schema';

export async function getParentSites(): Promise<APIResponse<Tables<'sites'>[]>> {
  return tables.select('sites', (query) => {
    query = query.eq('is_parent', true).order('name');
  });
}

export async function getUpperSites(): Promise<APIResponse<Tables<'sites'>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .or(`is_parent.eq.true,parent_id.is.null`)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'sites',
      context: 'get-parent-sites',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getSites(
  parentId?: string,
  name?: string
): Promise<APIResponse<Tables<'sites'>[]>> {
  return tables.select('sites', (query) => {
    query = query.eq('is_parent', false).order('name');
    if (parentId) query = query.eq('parent_id', parentId);
    if (name) query = query.ilike('name', `%${name}%`);
  });
}

export async function getSitesView(
  parentId?: string
): Promise<APIResponse<Tables<'sites_view'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('sites_view')
      .select('*')
      .eq('is_parent', false)
      .order('name', { ascending: true });
    if (parentId) query = query.eq('parent_id', parentId);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'sites',
      context: 'get-sites',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getSite(id: string): Promise<APIResponse<Tables<'sites'>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('sites').select('*').eq('id', id).single();

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data,
    };
  } catch (err) {
    return Debug.error({
      module: 'sites',
      context: 'get-site',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function putSite(sites: TablesInsert<'sites'>[]) {
  return tables.insert('sites', sites);
}

export async function updateSite(site: Tables<'sites'>): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('sites')
      .update({
        ...site,
      })
      .eq('id', site.id);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'sites',
      context: 'update-site',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function deleteSite(id: string): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('sites').delete().eq('id', id);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'sites',
      context: 'delete-site',
      message: String(err),
      time: new Date(),
    });
  }
}
