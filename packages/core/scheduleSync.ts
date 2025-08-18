'use server';

import { syncSource } from '@/core/syncSource';
import { getRows, insertRows } from '@/db/orm';
import { Tables } from '@/types/db';

export default async function scheduleSync(integration: Tables<'public', 'integrations'>) {
  const sourceTenants = await getRows('source', 'tenants', {
    filters: [
      ['source_id', 'eq', integration.source_id],
      ['tenant_id', 'eq', integration.tenant_id],
    ],
  });
  if (sourceTenants.error) throw sourceTenants.error.message;

  await syncSource(
    integration.source_id,
    integration.tenant_id,
    sourceTenants.data.rows.map((st) => ({
      siteId: st.site_id,
      sourceTenantId: st.id,
    }))
  );

  await insertRows('source', 'sync_jobs', {
    rows: [
      {
        source_id: integration.source_id,
        tenant_id: integration.tenant_id,
        est_duration: 30,
      },
    ],
  });
}
