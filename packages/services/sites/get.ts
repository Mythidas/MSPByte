'use server';

import { tables } from '@/db';
import { Tables } from '@/types/db';
import { APIResponse } from '@/types';
import { PaginationOptions } from '@/types/db';

function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function getParentSites() {
  return tables.select('public', 'sites', (query) => {
    query = query.eq('is_parent', true).order('name');
  });
}

export async function getUpperSites() {
  return tables.select('public', 'sites', (query) => {
    query = query.or(`is_parent.eq.true,parent_id.is.null`).order('name', { ascending: true });
  });
}

export async function getSites(parentId?: string, name?: string, isParent?: boolean) {
  return tables.select('public', 'sites', (query) => {
    query = query.order('name');
    if (parentId) {
      if (isUUID(parentId)) {
        query = query.eq('parent_id', parentId);
      } else query = query.eq('parent_slug', parentId);
    }
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
    'public',
    'sites_view',
    (query) => {
      query = query.order('name', { ascending: true });
      if (parentId) {
        if (isUUID(parentId)) {
          query = query.eq('parent_id', parentId);
        } else query = query.eq('parent_slug', parentId);
      }
      if (isParent !== undefined) query = query.eq('is_parent', isParent);
    },
    pagination
  );
}

export async function getSite(id: string): Promise<APIResponse<Tables<'public', 'sites'>>> {
  return tables.selectSingle('public', 'sites', (query) => {
    if (isUUID(id)) {
      query = query.eq('id', id);
    } else query = query.eq('slug', id);
  });
}

export async function getSiteView(id: string) {
  return tables.selectSingle('public', 'sites_view', (query) => {
    if (isUUID(id)) {
      query = query.eq('id', id);
    } else query = query.eq('slug', id);
  });
}

export async function getSitesCount(parentId?: string) {
  return tables.count('public', 'sites', (query) => {
    if (parentId) {
      if (isUUID(parentId)) {
        query = query.eq('parent_id', parentId);
      } else query = query.eq('parent_slug', parentId);
    }
  });
}
