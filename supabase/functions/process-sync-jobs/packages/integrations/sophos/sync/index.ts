'use server';

import { APIResponse, Debug, Timer } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import {
  getSiteSourceMapping,
  getSiteSourceMappings,
} from '../../../services/siteSourceMappings.ts';
import { getToken } from '../auth/getToken.ts';
import { syncMapping } from './syncMapping.ts';

export async function syncSophosPartner(
  integration: Tables<'source_integrations'>,
  siteId: string
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('SophosPartnerSync');

    const mapping = await getSiteSourceMapping(integration.source_id!, siteId);
    if (!mapping.ok) {
      throw new Error(mapping.error.message);
    }

    const token = await getToken(integration);
    if (!token.ok) {
      throw new Error(token.error.message);
    }

    const result = await syncMapping(token.data, mapping.data);
    if (!result.ok) throw result.error.message;

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
