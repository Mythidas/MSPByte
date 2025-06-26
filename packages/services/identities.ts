'use server';

import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from 'packages/db/schema';

export async function getSourceIdentities(mappingIds?: string[]) {
  return await tables.select('source_identities', (query) => {
    query = query.order('name');
    if (mappingIds) query = query.in('mapping_id', mappingIds);
  });
}

export async function getSourceIdentitiesView(sourceId?: string, siteIds?: string[]) {
  return await tables.select('source_identities_view', (query) => {
    query = query.order('site_id').order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourceIdentities(identities: TablesInsert<'source_identities'>[]) {
  return await tables.insert('source_identities', identities);
}

export async function updateSourceIdentity(
  id: string,
  identity: TablesUpdate<'source_identities'>
) {
  return await tables.update('source_identities', id, {
    ...identity,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteSourceIdentities(ids: string[]) {
  return await tables.delete('source_identities', ids);
}
