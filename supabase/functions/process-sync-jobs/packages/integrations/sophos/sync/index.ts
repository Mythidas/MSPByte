'use server';

import { APIResponse, Debug, Timer } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getSourceTenant } from '../../../services/source-tenants.ts';
import { getToken } from '../auth/getToken.ts';
import { syncTenant } from './syncTenant.ts';

export async function syncSophosPartner(
  integration: Tables<'source_integrations'>,
  siteId: string
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('SophosPartnerSync');

    const tenant = await getSourceTenant(integration.source_id!, siteId);
    if (!tenant.ok) {
      throw new Error(tenant.error.message);
    }

    const token = await getToken(integration);
    if (!token.ok) {
      throw new Error(token.error.message);
    }

    const result = await syncTenant(token.data, tenant.data);
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
