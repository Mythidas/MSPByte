'use server';

import { PaginationOptions } from '@/types/db';
import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from 'packages/db/schema';

export async function getSourceTenant(sourceId: string, siteId: string) {
  return tables.selectSingle('source_tenants', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export async function getSourceTenants(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return tables.select(
    'source_tenants',
    (query) => {
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function getSourceTenantsCount(sourceId?: string, siteIds?: string[]) {
  return tables.count('source_tenants', (query) => {
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
    'source_tenants_view',
    (query) => {
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function putSourceTenant(mapping: TablesInsert<'source_tenants'>[]) {
  return tables.insert('source_tenants', mapping);
}

export async function updateSourceTenant(id: string, mapping: TablesUpdate<'source_tenants'>) {
  return tables.update('source_tenants', id, mapping);
}

export async function deleteSourceTenant(id: string) {
  return tables.delete('source_tenants', (query) => {
    query = query.eq('id', id);
  });
}
