'use server';

import { PaginationOptions } from '@/types/db';
import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from '@/types/db';

export async function getSourcePolicies(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return tables.select(
    'source',
    'policies',
    (query) => {
      query = query.order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function getSourcePoliciesView(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return tables.select(
    'source',
    'policies_view',
    (query) => {
      query = query.order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function putSourcePolicies(policies: TablesInsert<'source', 'policies'>[]) {
  return tables.insert('source', 'policies', policies);
}

export async function updateSourcePolicy(id: string, policy: TablesUpdate<'source', 'policies'>) {
  return tables.update('source', 'policies', id, policy);
}

export async function deleteSourcePolicies(ids: string[]) {
  return tables.delete('source', 'policies', (query) => {
    query = query.in('id', ids);
  });
}
