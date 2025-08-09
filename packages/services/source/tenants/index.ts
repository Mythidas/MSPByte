'use server';

import { PaginationOptions } from '@/types/db';
import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from '@/types/db';

export async function getSourceTenant(sourceId: string, siteId: string) {
  return tables.selectSingle('source', 'tenants', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export async function getSourceTenants(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return tables.select(
    'source',
    'tenants',
    (query) => {
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function getSourceTenantsCount(sourceId?: string, siteIds?: string[]) {
  return tables.count('source', 'tenants', (query) => {
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceTenantsView(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return tables.select(
    'source',
    'tenants_view',
    (query) => {
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function putSourceTenant(mapping: TablesInsert<'source', 'tenants'>[]) {
  return tables.insert('source', 'tenants', mapping);
}

export async function updateSourceTenant(id: string, mapping: TablesUpdate<'source', 'tenants'>) {
  return tables.update('source', 'tenants', id, mapping);
}

export async function deleteSourceTenant(id: string) {
  return tables.delete('source', 'tenants', (query) => {
    query = query.eq('id', id);
  });
}
