import { setBearerToken } from '@/db/context';
import Debug from '@/shared/lib/Debug';
import { NextResponse } from 'next/server';
import { getRows } from '@/db/orm';
import { Tables } from '@/types/db';
import { DateTime } from 'luxon';
import scheduleSync from '@/core/scheduleSync';

export const runtime = 'nodejs'; // Important!
export const dynamic = 'force-dynamic'; // Avoid caching

export async function GET() {
  return await setBearerToken(process.env.NEXT_SUPABASE_SERVICE_KEY!, async () => {
    try {
      const integrations = await getRows('public', 'integrations_view');
      if (integrations.error) throw integrations.error.message;
      const syncable = [];
      const nowUtc = DateTime.utc();

      for (const integration of integrations.data.rows) {
        const tenantTime = integration.tenant_timezone || 'UTC';
        const now = nowUtc.setZone(tenantTime);

        const lastSynced = integration.last_sync_at
          ? DateTime.fromISO(integration.last_sync_at).setZone(tenantTime)
          : null;

        if (integration.sync_interval === 'daily') {
          const syncedToday = lastSynced ? lastSynced.hasSame(now, 'day') : false;

          if (!syncedToday) {
            syncable.push(integration as unknown as Tables<'public', 'integrations'>);
          }
        } else if (integration.sync_interval === 'hourly') {
          const hoursSinceLastSync = lastSynced ? now.diff(lastSynced, 'hours').hours : Infinity;

          if (hoursSinceLastSync >= 1) {
            syncable.push(integration as unknown as Tables<'public', 'integrations'>);
          }
        }
      }

      Debug.info({
        context: '/api/v1/cron/schedule-sync-jobs',
        module: 'GET',
        message: `${syncable.length} integrations syncing...`,
      });
      await Promise.all(syncable.map(scheduleSync));

      return NextResponse.json({ status: 'finished' });
    } catch (err) {
      Debug.error({
        module: '/api/v1/cron/schedule-sync-jobs',
        context: 'GET',
        message: String(err),
      });

      return new Response(JSON.stringify({ message: String(err) }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  });
}
