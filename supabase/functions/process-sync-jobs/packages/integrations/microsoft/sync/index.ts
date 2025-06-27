'use server';

import { APIResponse, Timer, Debug } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getSiteSourceMappings } from '../../../services/siteSourceMappings.ts';
import { syncMapping } from './syncMapping.ts';

export async function syncMicrosoft365(
  integration: Tables<'source_integrations'>,
  siteIds?: string[]
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Microsoft365Sync');
    const mappings = await getSiteSourceMappings(integration.source_id, siteIds);
    if (!mappings.ok) {
      throw new Error(mappings.error.message);
    }

    for (const mapping of mappings.data) {
      await syncMapping(mapping);
    }

    timer.summary();

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
