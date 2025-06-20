'use server';

import { getSource } from 'packages/services/sources';
import { getSiteSourceMappings } from 'packages/services/siteSourceMappings';
import { getEndpoints } from '@/lib/actions/server/sources/sophos/endpoints';
import {
  getSourceDevices,
  putSourceDevice,
  updateSourceDevice,
  deleteSourceDevice,
} from 'packages/services/devices';
import { putSourceMetric } from 'packages/services/metrics';
import { Debug, Timer } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Schema } from 'packages/db';
import { createClient } from 'packages/db/server';

export async function getToken(
  integration: Tables<'source_integrations'>
): Promise<APIResponse<string>> {
  try {
    if (integration.token) {
      const expiration = new Date(integration.token_expiration || 0);
      const expired = expiration.getTime() - new Date().getTime() <= 1000 * 1000 * 5 * 60;

      if (!expired)
        return {
          ok: true,
          data: integration.token,
        };
    }

    const clientId = (integration.config as Record<string, string>)['client_id'];
    const clientSecret = (integration.config as Record<string, string>)['client_secret'];
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'token',
    });

    const response = await fetch('https://id.sophos.com/api/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Sophos token: ${response.status} - ${error}`);
    }
    const data = await response.json();

    const supabase = await createClient();
    await supabase
      .from('source_integrations')
      .update({
        token: data.access_token,
        token_expiration: new Date(new Date().getTime() + data.expires_in * 1000).toISOString(),
      })
      .eq('id', integration.id);

    return {
      ok: true,
      data: data.access_token as string,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-token',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getPartnerID(token: string): Promise<APIResponse<string>> {
  try {
    const response = await fetch('https://api.central.sophos.com/whoami/v1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Sophos Partner ID: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      ok: true,
      data: data.id as string,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-partner-id',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function syncSophosPartner(
  integration: Tables<'source_integrations'>,
  siteIds?: string[]
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Sophos-Partner-Sync');
    const [supabase, token] = await Promise.all([createClient(), getToken(integration)]);

    if (!token.ok) {
      throw new Error(token.error.message);
    }

    const siteMappings = await getSiteSourceMappings(integration.source_id, siteIds);
    if (!siteMappings.ok) {
      throw new Error(siteMappings.error.message);
    }

    const devices = await getSourceDevices(integration.source_id, siteIds);
    if (!devices.ok) {
      throw new Error(devices.error.message);
    }

    for await (const mapping of siteMappings.data) {
      await syncSiteMapping(
        token.data,
        mapping,
        devices.data.filter((d) => d.site_id === mapping.site_id)
      );
    }

    const { error } = await supabase
      .from('source_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', integration?.id || '');

    if (error) {
      throw new Error(error.message);
    }

    timer.summary();

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-sophos-partner',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function syncSiteMapping(
  token: string,
  mapping: Tables<'site_source_mappings'>,
  sourceDevices: Tables<'source_devices_view'>[]
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Sync-Site-Mapping', false);
    timer.begin('get-devices-external');
    const devices = await getEndpoints(token, mapping);
    timer.end('get-devices-external');

    if (!devices.ok) {
      throw new Error(devices.error.message);
    }

    timer.begin('sort-devices');
    const newDevices = devices.data.filter((device) => {
      return !sourceDevices.find((sd) => sd.external_id === device.id);
    });
    const existingDevices = sourceDevices.filter((sd) => {
      return devices.data.find((device) => sd.external_id === device.id) !== undefined;
    });
    const deleteDevices = sourceDevices.filter((sd) => {
      return devices.data.find((d) => d.id === sd.external_id) === undefined;
    });
    timer.end('sort-devices');

    timer.begin('put-devices');
    for (const device of newDevices) {
      await putSourceDevice({
        id: '',
        tenant_id: mapping.tenant_id,
        site_id: mapping.site_id,
        source_id: mapping.source_id,
        external_id: device.id,
        hostname: device.hostname,
        os: device.os.name,
        serial: 'unknown',
        metadata: device,
      });
    }
    timer.end('put-devices');

    timer.begin('update-devices');
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
          external_id: device.external_id!,
        });
      } catch (err) {
        Debug.error({
          module: 'integrations',
          context: 'sync-site-mapping',
          message: String(err),
          time: new Date(),
        });
      }
    }
    timer.end('update-devices');

    timer.begin('delete-devices');
    for (const device of deleteDevices) {
      await deleteSourceDevice(device.id!);
    }
    timer.end('delete-devices');

    timer.begin('device-metrics');
    let upgradeable = 0;
    let mdrManaged = 0;
    for (const device of devices.data) {
      if (device.packages.protection.status === 'upgradable') upgradeable++;
      if (device.mdrManaged) mdrManaged++;
    }

    await putSourceMetric({
      id: '',
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Total Endpoints',
      metric: devices.data.length,
      unit: 'devices',
      total: null,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices' },
      metadata: {},
      is_historic: false,
      visual: null,
      thresholds: null,
      created_at: new Date().toISOString(),
    });

    await putSourceMetric({
      id: '',
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'MDR Managed Endpoints',
      metric: mdrManaged,
      unit: 'devices',
      total: devices.data.length,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices', search: 'mdr' },
      metadata: {},
      is_historic: false,
      visual: 'progress',
      thresholds: { info: 100, warn: 50, highest: true },
      created_at: new Date().toISOString(),
    });

    await putSourceMetric({
      id: '',
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Upgradable Endpoints',
      metric: upgradeable,
      unit: 'devices',
      total: devices.data.length,
      route: '/sources/sophos-partner',
      filters: { tab: 'devices', search: 'upgradable' },
      metadata: {},
      is_historic: false,
      visual: 'progress',
      thresholds: { info: 0, warn: 30, crticial: 60, highest: false },
      created_at: new Date().toISOString(),
    });
    timer.end('device-metrics');
    timer.summary();

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-site-mapping',
      message: String(err),
      time: new Date(),
    });
  }
}
