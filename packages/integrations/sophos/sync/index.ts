'use server';

import { Tables } from '@/db/schema';
import { getToken } from '@/integrations/sophos/auth';
import { syncTenant } from '@/integrations/sophos/sync/syncTenant';
import { Debug, Timer } from '@/lib/utils';
import { getSourceTenant } from '@/services/source/tenants';
import { APIResponse } from '@/types';

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
