'use server';

import { APIResponse, Debug, Timer } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getSiteSourceMappings } from '../../../services/siteSourceMappings.ts';
import { getToken } from '../auth/getToken.ts';
import { syncMapping } from './syncMapping.ts';

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

    const token = await getToken(integration);
    if (!token.ok) {
      throw new Error(token.error.message);
    }

    for await (const mapping of siteMappings.data) {
      await syncMapping(token.data, mapping);
    }

    timer.summary();

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'syncSophosPartner',
      message: String(err),
      time: new Date(),
    });
  }
}
