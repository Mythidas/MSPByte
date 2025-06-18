'use server'

import { TablesDeleteGeneric, TablesInsertGeneric, TablesSelectGeneric, TablesUpdateGeneric } from "@/lib/actions/server/generics";
import { ActionResponse } from "@/types";
import { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export async function getSourceLicenseCapabilities(vendor?: string, skus?: string[]): Promise<ActionResponse<Tables<'source_license_capabilities'>[]>> {
  return await TablesSelectGeneric('source_license_capabilities', (query) => {
    query = query.order('name');
    if (vendor) query = query.eq('vendor', vendor);
    if (skus) query = query.in('sku', skus);
  });
}

export async function putSourceLicenseCapabilities(rows: TablesInsert<'source_license_capabilities'>[]): Promise<ActionResponse<Tables<'source_license_capabilities'>[]>> {
  return await TablesInsertGeneric('source_license_capabilities', rows);
}

export async function updateSourceLicenseCapabilities(id: string, policy: TablesUpdate<'source_license_capabilities'>): Promise<ActionResponse<null>> {
  return await TablesUpdateGeneric('source_license_capabilities', id, policy);
}

export async function deleteSourceLicenseCapabilities(id: string): Promise<ActionResponse<null>> {
  return await TablesDeleteGeneric('source_license_capabilities', id);
}