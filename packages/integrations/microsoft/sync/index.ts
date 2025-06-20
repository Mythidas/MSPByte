import { getSiteSourceMappings } from 'packages/services/siteSourceMappings';
import { Debug } from '@/lib/utils';
import { syncMapping } from 'packages/integrations/microsoft/sync/syncMapping';
import { Tables } from 'packages/db/schema';
import { APIResponse } from '@/types';

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

    // Update last sync timestamp
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
