'use server';

import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from 'packages/db/schema';

export async function getSourcePolicies(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_policies', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourcePolicies(policies: TablesInsert<'source_policies'>[]) {
  return tables.insert('source_policies', policies);
}

export async function updateSourcePolicy(id: string, policy: TablesUpdate<'source_policies'>) {
  return tables.update('source_policies', id, policy);
}

export async function deleteSourcePolicies(ids: string[]) {
  return tables.delete('source_policies', ids);
}
