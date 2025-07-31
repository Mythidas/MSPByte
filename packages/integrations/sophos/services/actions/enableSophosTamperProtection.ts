'use server';

import { getRow, insertRows, updateRow } from '@/db/orm';
import { Tables } from '@/db/schema';
import { getToken } from '@/integrations/sophos/auth';
import { enableTamperProtection } from '@/integrations/sophos/services/endpoints/enableTamperProtection';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export default async function enableSophosTamperProtection(
  devices: Tables<'source_devices_view'>[],
  userId?: string
): Promise<APIResponse<number>> {
  try {
    const getIntegration = await getRow('source_integrations', {
      filters: [['source_id', 'eq', 'sophos-partner']],
    });
    if (!getIntegration.ok) throw getIntegration.error.message;
    if (!devices.length) throw 'No devices provided';

    const { data: integration } = getIntegration;
    const tenants: Record<string, Tables<'source_tenants'>> = {};
    const errors: string[] = [];

    for await (const device of devices) {
      let tenant = tenants[device.site_id!];
      if (!tenant) {
        const getTenant = await getRow('source_tenants', {
          filters: [
            ['site_id', 'eq', device.site_id],
            ['source_id', 'eq', device.source_id],
          ],
        });
        if (!getTenant.ok) continue;

        tenants[getTenant.data.site_id] = { ...getTenant.data };
        tenant = tenants[getTenant.data.site_id];
      }

      const token = await getToken(integration);
      if (!token.ok) continue;

      const update = await enableTamperProtection(token.data, tenant, device.external_id!);
      if (!update.ok) {
        errors.push(`${device.hostname}: ${update.error.message}`);
      }

      await updateRow('source_devices', {
        id: device.id!,
        row: {
          metadata: {
            ...(device.metadata as any),
            tamperProtectionEnabled: true,
          },
        },
      });
    }

    for await (const [_key, value] of Object.entries(tenants)) {
      const devicesFiltered = devices.filter((d) => d.site_id === value.site_id);
      await insertRows('activity_feeds', {
        rows: [
          {
            tenant_id: value.tenant_id,
            user_id: userId,
            site_id: value.site_id,
            type: 'security',
            action: 'enable_tamper_protection',
            source_id: 'sophos-partner',
            status: errors.length ? 'error' : 'completed',
            summary: `Enable tampter protection for ${devicesFiltered.length} devices`,
            metadata: {
              devices: devicesFiltered.map((d) => d.hostname),
              errors: errors.length ? errors : undefined,
            },
            trigger_source: userId ? 'user' : 'system',
          },
        ],
      });
    }

    return {
      ok: true,
      data: errors.length,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartnerActions',
      context: 'enableSophosTamperProtection',
      message: String(err),
      time: new Date(),
    });
  }
}
