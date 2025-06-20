'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { updateSourceIntegration } from '@/services/integrations';
import { Tables } from '@/db/schema';
import { syncMapping } from '@/integrations/microsoft/sync/syncMapping';
import { getSiteSourceMappings } from '@/services/siteSourceMappings';

export async function syncMicrosoft365(
  integration: Tables<'source_integrations'>,
  siteIds?: string[]
): Promise<APIResponse<null>> {
  try {
    const mappings = await getSiteSourceMappings(integration.source_id, siteIds);
    if (!mappings.ok) {
      throw new Error(mappings.error.message);
    }

    for (const mapping of mappings.data) {
      await syncMapping(mapping);
    }

    await updateSourceIntegration(integration.id, {
      last_sync_at: new Date().toISOString(),
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'syncMicrosoft365',
      message: String(err),
      time: new Date(),
    });
  }
}
