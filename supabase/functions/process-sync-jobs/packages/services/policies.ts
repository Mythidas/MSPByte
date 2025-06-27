'use server';

import { tables } from '../db/index.ts';
import { TablesInsert, TablesUpdate } from '../db/schema.ts';

export function getSourcePolicies(sourceId?: string, siteIds?: string[]) {
  return tables.select('source_policies', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export function putSourcePolicies(policies: TablesInsert<'source_policies'>[]) {
  return tables.insert('source_policies', policies);
}

export function updateSourcePolicy(id: string, policy: TablesUpdate<'source_policies'>) {
  return tables.update('source_policies', id, policy);
}

export function deleteSourcePolicies(ids: string[]) {
  return tables.delete('source_policies', ids);
}
