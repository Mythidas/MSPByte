'use server'

import { Tables } from "@/types/database";

export async function getEndpoints(token: string, mapping: Tables<'site_source_mappings'>) {
  if (!token) return [];

  try {

    const path = "/endpoint/v1/endpoints?pageSize=500&pageTotal=true";
    const metadata = mapping.metadata as Record<string, any>;
    const url = metadata.apiHost + path;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Tenant-ID": mapping.external_id
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`Sophos Endpoints: ${error}`);
      return [];
    }

    const data = await response.json();
    return [...data.items];
  } catch (err) {
    console.error('Failed to fetch endpoints: ', err);
    return [];
  }
}