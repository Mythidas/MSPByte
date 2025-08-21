'use server';

import { getRow, insertRows, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import { getToken } from '@/integrations/sophos/auth';
import { enableTamperProtection } from '@/integrations/sophos/services/endpoints/enableTamperProtection';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export default async function scheduleSophosFirewallUpgrade(
  devices: Tables<'source', 'devices_view'>[],
  userId?: string
): Promise<APIResponse<number>> {
  try {
    const getIntegration = await getRow('public', 'integrations', {
      filters: [['source_id', 'eq', 'sophos-partner']],
    });
    if (getIntegration.error) throw getIntegration.error.message;
    if (!devices.length) throw 'No devices provided';

    const { data: integration } = getIntegration;
    const tenants: Record<string, Tables<'source', 'tenants'>> = {};
    const errors: string[] = [];

    for await (const device of devices) {
      let tenant = tenants[device.site_id!];
      if (!tenant) {
        const getTenant = await getRow('source', 'tenants', {
          filters: [
            ['site_id', 'eq', device.site_id],
            ['source_id', 'eq', device.source_id],
          ],
        });
        if (getTenant.error) continue;

        tenants[getTenant.data.site_id] = { ...getTenant.data };
        tenant = tenants[getTenant.data.site_id];
      }

      const token = await getToken(integration);
      if (token.error) continue;

      const update = await enableTamperProtection(token.data, tenant, device.external_id!);
      if (update.error) {
        errors.push(`${device.hostname}: ${update.error.message}`);
      }

      await updateRow('source', 'devices', {
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
      await insertRows('public', 'activity_feeds', {
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
      data: errors.length,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartnerActions',
      context: 'enableSophosTamperProtection',
      message: String(err),
    });
  }
}
