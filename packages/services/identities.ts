'use server';

import { MicrosoftIdentityMetadata } from '@/integrations/microsoft/types';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { tables } from 'packages/db';

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
    const identities = await tables.select('source', 'identities', (query) => {
      query = query.order('site_id').order('name');
      if (sourceId) query = query.eq('source_id', sourceId);
      if (siteIds) query = query.in('site_id', siteIds);
    });

    if (identities.error) throw identities.error.message;

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
    });
  }
}
