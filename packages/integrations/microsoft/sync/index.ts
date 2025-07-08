'use server';

import { Tables } from '@/db/schema';
import { syncTenant } from '@/integrations/microsoft/sync/syncTenant';
import { Debug, Timer } from '@/lib/utils';
import { getSourceTenant } from '@/services/source/tenants/tenants';
import { APIResponse } from '@/types';

export async function syncMicrosoft365(
  integration: Tables<'source_integrations'>,
  siteId: string
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Microsoft365Sync');
    const tenant = await getSourceTenant(integration.source_id!, siteId);
    if (!tenant.ok) {
      throw new Error(tenant.error.message);
    }

    const result = await syncTenant(tenant.data);
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
