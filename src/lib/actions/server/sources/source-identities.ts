'use server'

import { TablesDeleteGeneric, TablesInsertGeneric, TablesSelectGeneric, TablesUpdateGeneric } from "@/lib/actions/server/generics";
import { TablesInsert, TablesUpdate } from "@/types/database";

export async function getSourceIdentities(sourceId?: string, siteIds?: string[]) {
  return await TablesSelectGeneric('source_identities', (query) => {
    query = query.order('site_id').order('display_name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  })
}

export async function putSourceIdentities(identities: TablesInsert<'source_identities'>[]) {
  return await TablesInsertGeneric('source_identities', identities);
}

export async function updateSourceIdentity(id: string, identity: TablesUpdate<'source_identities'>) {
  return await TablesUpdateGeneric('source_identities', id, identity);
}

export async function getSourceIdentityLicenses(sourceId?: string, siteIds?: string[]) {
  return await TablesSelectGeneric('source_identity_licenses', (query) => {
    query = query.order('display_name');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);
  });
}

export async function putSourceIdentityLicenses(licenses: TablesInsert<'source_identity_licenses'>[]) {
  return await TablesInsertGeneric('source_identity_licenses', licenses);
}

export async function deleteSourceIdentityLicense(id: string) {
  return await TablesDeleteGeneric('source_identity_licenses', id);
}