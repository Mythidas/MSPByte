import { setBearerToken } from '@/db/context';
import { Debug } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { getRows, insertRows } from '@/db/orm';
import { Tables } from '@/db/schema';

export const runtime = 'nodejs'; // Important!
export const dynamic = 'force-dynamic'; // Avoid caching

export async function GET() {
  return await setBearerToken(process.env.NEXT_SUPABASE_SERVICE_KEY!, async () => {
    try {
      const integrations = await getRows('source_integrations');
      if (!integrations.ok) throw integrations.error.message;
      const syncable = [];

      for (const integration of integrations.data.rows) {
        if (integration.last_sync_at) {
          const now = new Date();
          const target = new Date(
            new Date(integration.last_sync_at).getTime() +
              1000 * 60 * 60 * integration.sync_interval
          );
          const shouldSync = target.getTime() >= now.getTime();

          if (shouldSync) {
            syncable.push(integration);
          }
        } else {
          syncable.push(integration);
        }
      }

      await Promise.all(syncable.map(startSync));

      return NextResponse.json({ status: 'finished' });
    } catch (err) {
      Debug.error({
        module: '/api/v1/schedule-sync-jobs',
        context: 'GET',
        message: String(err),
        time: new Date(),
      });

      return new Response(JSON.stringify({ message: String(err) }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  });
}

async function startSync(integration: Tables<'source_integrations'>) {
  const sourceTenants = await getRows('source_tenants', {
    filters: [
      ['source_id', 'eq', integration.source_id],
      ['tenant_id', 'eq', integration.tenant_id],
    ],
  });
  if (!sourceTenants.ok) throw sourceTenants.error.message;
  const siteRows = sourceTenants.data.rows.map((st) => {
    return {
      source_id: st.source_id,
      tenant_id: st.tenant_id,
      site_id: st.site_id,
      est_duration: 30,
    };
  });

  await insertRows('source_sync_jobs', {
    rows: [
      ...siteRows,
      {
        source_id: integration.source_id,
        tenant_id: integration.tenant_id,
        est_duration: 30,
      },
    ],
  });
}
