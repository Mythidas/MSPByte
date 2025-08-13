'use server';

import SyncChain from '@/core/SyncChain';
import { getRow } from '@/db/orm';
import { Tables } from '@/types/db';

export async function siteSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const integration = await getRow('public', 'integrations', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['tenant_id', 'eq', job.tenant_id],
    ],
  });
  if (integration.error) {
    throw 'Failed to find source integration';
  }
  const tenant = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['site_id', 'eq', job.site_id],
    ],
  });
  if (tenant.error) throw 'Failed to find Source Tenant';

  const sync = new SyncChain({
    tenant_id: '',
    state: job.state as Record<string, string | null>,
    job,
    getState: () => '',
    setState: () => {},
  });

  return await sync.run();
}
