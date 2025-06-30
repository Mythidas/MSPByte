'use server';

import { APIResponse, Timer, Debug } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getSiteSourceMapping } from '../../../services/siteSourceMappings.ts';
import { syncMapping } from './syncMapping.ts';

export async function syncMicrosoft365(
  integration: Tables<'source_integrations'>,
  siteId: string
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Microsoft365Sync');
    const mapping = await getSiteSourceMapping(integration.source_id!, siteId);
    if (!mapping.ok) {
      throw new Error(mapping.error.message);
    }

    const result = await syncMapping(mapping.data);
    if (!result.ok) throw result.error.message;

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
