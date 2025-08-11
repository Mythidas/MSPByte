import { setBearerToken } from '@/db/context';
import { Debug } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { getRows, insertRows } from '@/db/orm';
import { Tables } from '@/types/db';
import { DateTime } from 'luxon';

export const runtime = 'nodejs'; // Important!
export const dynamic = 'force-dynamic'; // Avoid caching

export async function GET() {
  return await setBearerToken(process.env.NEXT_SUPABASE_SERVICE_KEY!, async () => {
    try {
      const integrations = await getRows('public', 'integrations_view');
      if (!integrations.ok) throw integrations.error.message;
      const syncable = [];
      const nowUtc = DateTime.utc();

      for (const integration of integrations.data.rows) {
        const tenantTime = integration.tenant_timezone || 'UTC';
        const now = nowUtc.setZone(tenantTime);

        const lastSynced = integration.last_sync_at
          ? DateTime.fromISO(integration.last_sync_at).setZone(tenantTime)
          : null;

        if (integration.sync_interval === 'daily') {
          // Replace this logic with tenant defining their sync time
          const hour = now.hour;
          const inAfterHours = hour >= 22 || hour < 4;

          const syncedToday = lastSynced ? lastSynced.hasSame(now, 'day') : false;

          if (inAfterHours && !syncedToday) {
            syncable.push(integration as unknown as Tables<'public', 'integrations'>);
          }
        } else if (integration.sync_interval === 'hourly') {
          const hoursSinceLastSync = lastSynced ? now.diff(lastSynced, 'hours').hours : Infinity;

          if (hoursSinceLastSync >= 1) {
            syncable.push(integration as unknown as Tables<'public', 'integrations'>);
          }
        }
      }

      await Promise.all(syncable.map(startSync));

      return NextResponse.json({ status: 'finished' });
    } catch (err) {
      Debug.error({
        module: '/api/v1/cron/schedule-sync-jobs',
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

async function startSync(integration: Tables<'public', 'integrations'>) {
  const sourceTenants = await getRows('source', 'tenants', {
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

  await insertRows('public', 'source_sync_jobs', {
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
