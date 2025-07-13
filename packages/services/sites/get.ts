'use server';

import { tables } from '@/db';
import { Tables } from '@/db/schema';
import { createClient } from '@/db/server';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { PaginationOptions } from '@/types/data-table';

export async function getParentSites() {
  return tables.select('sites', (query) => {
    query = query.eq('is_parent', true).order('name');
  });
}

export async function getUpperSites() {
  return tables.select('sites', (query) => {
    query = query.or(`is_parent.eq.true,parent_id.is.null`).order('name', { ascending: true });
  });
}

export async function getSites(parentId?: string, name?: string, isParent?: boolean) {
  return tables.select('sites', (query) => {
    query = query.order('name');
    if (parentId) query = query.eq('parent_id', parentId);
    if (name) query = query.ilike('name', `%${name}%`);
    if (isParent !== undefined) query = query.eq('is_parent', isParent);
  });
}

export async function getSitesView(
  parentId?: string,
  isParent?: boolean,
  pagination?: PaginationOptions
) {
  return tables.select(
    'sites_view',
    (query) => {
      query = query.order('name', { ascending: true });
      if (parentId) query = query.eq('parent_id', parentId);
      if (isParent !== undefined) query = query.eq('is_parent', isParent);
    },
    pagination
  );
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

export async function getSiteView(id: string) {
  return tables.selectSingle('sites_view', (query) => {
    query = query.eq('id', id);
  });
}

export async function getSitesCount(parentId?: string) {
  return tables.count('sites', (query) => {
    if (parentId) query = query.eq('parent_id', parentId);
  });
}
