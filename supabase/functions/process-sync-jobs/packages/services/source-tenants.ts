'use server';

import { tables } from '../db/index.ts';
import { TablesInsert, TablesUpdate } from '../db/schema.ts';

export function getSourceTenant(sourceId: string, siteId: string) {
  return tables.selectSingle('source_tenants', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export function getSourceTenants(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_tenants', (query) => {
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export function putSourceTenant(mapping: TablesInsert<'source_tenants'>[]) {
  return tables.insert('source_tenants', mapping);
}

export function updateSourceTenant(id: string, mapping: TablesUpdate<'source_tenants'>) {
  return tables.update('source_tenants', id, mapping);
}

export function deleteSourceTenant(id: string) {
  return tables.delete('source_tenants', [id]);
}
