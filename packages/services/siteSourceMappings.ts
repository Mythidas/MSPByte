'use server';

import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from 'packages/db/schema';

export async function getSiteMappings(sourceId?: string) {
  return tables.select('site_source_mappings', (query) => {
    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }
  });
}

export async function getSiteMapping(id: string) {
  return tables.selectSingle('site_source_mappings', (query) => {
    query = query.eq('id', id);
  });
}

export async function getSiteSourceMapping(sourceId: string, siteId: string) {
  return tables.selectSingle('site_source_mappings', (query) => {
    query = query.eq('source_id', sourceId).eq('site_id', siteId);
  });
}

export async function getSiteSourceMappings(sourceId?: string, siteIds?: string[]) {
  return tables.select('site_source_mappings', (query) => {
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSiteSourceMapping(mapping: TablesInsert<'site_source_mappings'>[]) {
  return tables.insert('site_source_mappings', mapping);
}

export async function updateSiteSourceMapping(
  id: string,
  mapping: TablesUpdate<'site_source_mappings'>
) {
  return tables.update('site_source_mappings', id, mapping);
}

export async function deleteSiteSourceMapping(id: string) {
  return tables.delete('site_source_mappings', [id]);
}
