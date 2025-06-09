'use server'

import { getEndpoints } from "@/lib/functions/external/sophos/endpoints";
import { deleteSourceDevice, getSiteSourceMappingsBySource, getSourceDevices, putSourceDevice, putSourceMetric, updateSourceDevice } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getToken(integration: Tables<'source_integrations'>) {
  if (integration.token) {

    const expiration = new Date(integration.token_expiration || 0);
    const expired = (expiration.getTime() - new Date().getTime()) <= 1000 * 1000 * 5 * 60;

    if (!expired) return integration.token;
  }

  const clientId = ((integration.config) as Record<string, string>)['client_id'];
  const clientSecret = ((integration.config) as Record<string, string>)['client_secret'];
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "token",
  });

  const response = await fetch("https://id.sophos.com/api/v2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Sophos token: ${response.status} - ${error}`);
  }
  const data = await response.json();

  const supabase = await createClient();
  await supabase.from('source_integrations').update({
    token: data.access_token,
    token_expiration: new Date(new Date().getTime() + data.expires_in * 1000).toISOString()
  }).eq('id', integration.id);

  return data.access_token as string;
}

export async function getPartnerID(token: string) {
  const response = await fetch("https://api.central.sophos.com/whoami/v1", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Sophos Partner ID: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.id as string;
}

export async function syncIntegration(integration: Tables<'source_integrations'>) {
  const supabase = await createClient();
  const token = await getToken(integration);
  const siteMappings = await getSiteSourceMappingsBySource(integration.source_id);

  for (const mapping of siteMappings) {
    const devices = await getEndpoints(token, mapping);
    const sourceDevices = await getSourceDevices(mapping.site_id, mapping.source_id);

    const newDevices = devices.filter((device) => {
      return !sourceDevices.find((sd) => sd.external_id === device.id);
    });
    const existingDevices = sourceDevices.filter((sd) => {
      return !!devices.find((device) => sd.external_id === device.id);
    });
    const deleteDevices = sourceDevices.filter((sd) => {
      return !devices.find((d) => d.id === sd.external_id);
    });

    for (const device of newDevices) {
      await putSourceDevice({
        id: "",
        tenant_id: mapping.tenant_id,
        site_id: mapping.site_id,
        source_id: mapping.source_id,
        external_id: device.id,
        hostname: device.hostname,
        os: device.os.name,
        serial: "unknown",
        metadata: device
      });
    }

    for (const device of existingDevices) {
      const source = devices.find((d) => d.id === device.external_id);
      await updateSourceDevice({
        ...device,
        hostname: source.hostname,
        os: source.os.name,
        metadata: source
      });
    }

    for (const device of deleteDevices) {
      await deleteSourceDevice(device.id);
    }

    let upgradeable = 0;
    let mdrManaged = 0;
    for (const device of devices) {
      if (device.packages.protection.status === 'upgradable') upgradeable++;
      if (device.mdrManaged) mdrManaged++;
    }

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'MDR Managed Endpoints',
      metric: mdrManaged,
      unit: 'devices',
      total: null,
      filters: {},
      metadata: {},
      created_at: null
    });

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Upgradable Endpoints',
      metric: upgradeable,
      unit: 'devices',
      total: null,
      filters: {},
      metadata: {},
      created_at: null
    });
  }

  const { error } = await supabase.from('source_integrations').update({
    last_sync_at: new Date().toISOString(),
  }).eq('id', integration.id);

  if (error) {
    console.log("SophosPartner sync: " + error.message);
  }
}