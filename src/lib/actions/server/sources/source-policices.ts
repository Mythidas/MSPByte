'use server'

import { TablesDeleteGeneric, TablesInsertGeneric, TablesSelectGeneric, TablesUpdateGeneric } from "@/lib/actions/server/generics";
import { ActionResponse } from "@/types";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export async function getSourcePolicies(sourceId?: string, siteIds?: string[]): Promise<ActionResponse<Tables<'source_policies'>[]>> {
  return await TablesSelectGeneric('source_policies', (query) => {
    query = query.order('name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourcePolicies(policies: TablesInsert<'source_policies'>[]): Promise<ActionResponse<Tables<'source_policies'>[]>> {
  return await TablesInsertGeneric('source_policies', policies);
}

export async function updateSourcePolicy(id: string, policy: TablesUpdate<'source_policies'>): Promise<ActionResponse<null>> {
  return await TablesUpdateGeneric('source_policies', id, policy);
}

export async function deleteSourcePolicy(id: string): Promise<ActionResponse<null>> {
  return await TablesDeleteGeneric('source_policies', id);
}