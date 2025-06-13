'use server'

import { getSource } from "@/lib/actions/server/sources";
import { getSiteSourceMappings } from "@/lib/actions/server/sources/site-source-mappings";
import { getEndpoints } from "@/lib/actions/server/sources/sophos/endpoints";
import { getSourceDevices, putSourceDevice, updateSourceDevice, deleteSourceDevice } from "@/lib/actions/server/sources/source-devices";
import { putSourceMetric } from "@/lib/actions/server/sources/source-metrics";
import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getToken(integration: Tables<'source_integrations'>): Promise<ActionResponse<string>> {
  try {
    if (integration.token) {
      const expiration = new Date(integration.token_expiration || 0);
      const expired = (expiration.getTime() - new Date().getTime()) <= 1000 * 1000 * 5 * 60;

      if (!expired)
        return {
          ok: true,
          data: integration.token
        };
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

    return {
      ok: true,
      data: data.access_token as string
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-token',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getPartnerID(token: string): Promise<ActionResponse<string>> {
  try {
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
    return {
      ok: true,
      data: data.id as string
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-partner-id',
      message: String(err),
      time: new Date()
    });
  }
}

export async function syncSophosPartner(integration: Tables<'source_integrations'>): Promise<ActionResponse<null>> {
  try {


    const start = new Date();
    const [supabase, source, token] = await Promise.all([createClient(), getSource(undefined, 'sophos-parter'), getToken(integration)]);

    if (!source.ok) {
      throw new Error(source.error.message);
    }
    if (!token.ok) {
      throw new Error(token.error.message);
    }

    const siteMappings = await getSiteSourceMappings(source.data.id);
    if (!siteMappings.ok) {
      throw new Error(siteMappings.error.message);
    }

    for await (const mapping of siteMappings.data) {
      await syncSiteMapping(token.data, mapping);
    }

    const { error } = await supabase.from('source_integrations').update({
      last_sync_at: new Date().toISOString(),
    }).eq('id', integration?.id || "");

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Sophos Partner Synced: ${((new Date().getTime() - start.getTime()) / (1000 * 60)).toFixed(2)} minutes`);

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-sophos-partner',
      message: String(err),
      time: new Date()
    });
  }
}

export async function syncSiteMapping(token: string, mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<null>> {
  try {

    const devices = await getEndpoints(token, mapping);
    const sourceDevices = await getSourceDevices(mapping.source_id, mapping.site_id);

    if (!devices.ok) {
      throw new Error(devices.error.message);
    }
    if (!sourceDevices.ok) {
      throw new Error(sourceDevices.error.message);
    }

    const newDevices = devices.data.filter((device) => {
      return !sourceDevices.data.find((sd) => sd.external_id === device.id);
    });
    const existingDevices = sourceDevices.data.filter((sd) => {
      return devices.data.find((device) => sd.external_id === device.id) !== undefined;
    });
    const deleteDevices = sourceDevices.data.filter((sd) => {
      return devices.data.find((d) => d.id === sd.external_id) === undefined;
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
      const source = devices.data.find((d) => d.id === device.external_id);
      try {
        await updateSourceDevice({
          id: device.id!,
          tenant_id: device.tenant_id!,
          site_id: device.site_id!,
          source_id: device.source_id!,
          hostname: source.hostname,
          os: source.os.name,
          metadata: source,
          serial: '',
          external_id: device.external_id!
        });
      } catch (err) {
        Debug.error({
          module: 'integrations',
          context: 'sync-site-mapping',
          message: String(err),
          time: new Date()
        });
      }
    }

    for (const device of deleteDevices) {
      await deleteSourceDevice(device.id!);
    }

    let upgradeable = 0;
    let mdrManaged = 0;
    for (const device of devices.data) {
      if (device.packages.protection.status === 'upgradable') upgradeable++;
      if (device.mdrManaged) mdrManaged++;
    }

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Total Endpoints',
      metric: devices.data.length,
      unit: 'devices',
      total: null,
      route: '/devices',
      filters: {},
      metadata: {},
      created_at: new Date().toISOString()
    });

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'MDR Managed Endpoints',
      metric: mdrManaged,
      unit: 'devices',
      total: devices.data.length,
      route: '/devices',
      filters: { "search": "mdr" },
      metadata: {},
      created_at: new Date().toISOString()
    });

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Upgradable Endpoints',
      metric: upgradeable,
      unit: 'devices',
      total: devices.data.length,
      route: '/devices',
      filters: { tab: "sophos-partner", search: "upgradable" },
      metadata: {},
      created_at: new Date().toISOString()
    });

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-site-mapping',
      message: String(err),
      time: new Date()
    });
  }
}