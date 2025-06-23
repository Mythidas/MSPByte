'use server';

import { Tables } from '@/db/schema';
import { getToken } from '@/integrations/sophos/auth';
import { syncMapping } from '@/integrations/sophos/sync/syncMapping';
import { Debug, Timer } from '@/lib/utils';
import { updateSourceIntegration } from '@/services/integrations';
import { getSiteSourceMappings } from '@/services/siteSourceMappings';
import { APIResponse } from '@/types';

export async function syncSophosPartner(
  integration: Tables<'source_integrations'>,
  siteIds?: string[]
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('SophosPartnerSync');

    const siteMappings = await getSiteSourceMappings(integration.source_id, siteIds);
    if (!siteMappings.ok) {
      throw new Error(siteMappings.error.message);
    }

    for await (const mapping of siteMappings.data) {
      const token = await getToken(integration);
      if (!token.ok) {
        throw new Error(token.error.message);
      }

      await syncMapping(token.data, mapping);
    }

    await updateSourceIntegration(integration.id, {
      last_sync_at: new Date().toISOString(),
    });

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
