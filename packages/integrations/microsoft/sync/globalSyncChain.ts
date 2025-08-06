import SyncChain from '@/core/SyncChain';
import { getRow, updateRow } from '@/db/orm';
import { Tables } from '@/db/schema';

export async function globalSyncChain(job: Tables<'source_sync_jobs'>) {
  const sync = new SyncChain({
    tenant_id: job.source_tenant_id!,
    state: job.state as Record<string, string | null>,
    job,
    getState: () => '',
    setState: () => {},
  }).final(async () => {
    const integration = await getRow('source_integrations', {
      filters: [
        ['source_id', 'eq', job.source_id],
        ['tenant_id', 'eq', job.tenant_id],
      ],
    });
    if (!integration.ok) {
      throw 'Failed to find source integration';
    }

    await updateRow('source_integrations', {
      id: integration.data.id,
      row: {
        last_sync_at: new Date().toISOString(),
      },
    });
  });

  return await sync.run();
}
