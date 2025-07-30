'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { PaginationOptions } from '@/types/db';
import { MicrosoftIdentityMetadata } from '@/types/source/identities';
import { tables } from 'packages/db';
import { TablesInsert, TablesUpdate } from 'packages/db/schema';

export async function getSourceIdentities(sourceId: string, siteIds?: string[]) {
  return await tables.select('source_identities', (query) => {
    query = query.order('name').eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceIdentitiesCount(sourceId: string, siteIds?: string[]) {
  return await tables.count('source_identities', (query) => {
    query = query.order('name').eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function getSourceIdentitiesView(
  sourceId?: string,
  siteIds?: string[],
  pagination?: PaginationOptions
) {
  return await tables.select(
    'source_identities_view',
    (query) => {
      query = query.order('site_id').order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    },
    pagination
  );
}

export async function getSourceIdentitiesUniqueRolesAndGroups(
  sourceId: string,
  siteIds?: string[]
): Promise<
  APIResponse<{
    roles: string[];
    groups: string[];
  }>
> {
  try {
    const identities = await tables.select('source_identities', (query) => {
      query = query.order('site_id').order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    });

    if (!identities.ok) throw identities.error.message;

    const roleSet = new Set<string>();
    const groupSet = new Set<string>();

    for (const identity of identities.data.rows) {
      const roles = (identity.metadata as MicrosoftIdentityMetadata)?.roles ?? [];
      const groups = (identity.metadata as MicrosoftIdentityMetadata)?.groups ?? [];

      for (const role of roles) {
        if (role?.displayName) {
          roleSet.add(role.displayName);
        }
      }

      for (const group of groups) {
        if (group?.displayName) {
          groupSet.add(group.displayName);
        }
      }
    }

    return {
      ok: true,
      data: {
        roles: Array.from(roleSet).map((displayName) => displayName),
        groups: Array.from(groupSet).map((displayName) => displayName),
      },
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_source_identities_unique_roles_and_groups`,
      message: String(err),
      time: new Date(),
    });
  }
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
  return await tables.delete('source_identities', (query) => {
    query = query.in('id', ids);
  });
}
