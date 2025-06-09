'use server'

import { getPartnerID, getToken } from "@/lib/functions/external/sophos";
import { Tables } from "@/types/database";

export async function getTenants(integration: Tables<'source_integrations'>) {
  const token = await getToken(integration);
  if (!token) return [];

  const sophosPartner = await getPartnerID(token);
  const tenants = [];
  const url = "https://api.central.sophos.com/partner/v1/tenants";

  let page = 1;
  while (true) {
    const response = await fetch(`${url}?pageTotal=true&pageSize=100&page=${page}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Partner-ID": sophosPartner
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Sophos Tenants: ${response.status} - ${error}`);
    }

    const data = await response.json();
    tenants.push(...data.items);

    if (data.pages.current >= data.pages.total) {
      break;
    }
    page++;
  }

  return tenants.sort((a, b) => a.name.localeCompare(b.name));
}