// app/api/sync-job.ts
import { syncJob } from '@/core/syncJob';
import { createClient } from '@/db/server';
import { setBearerToken } from '@/db/context';
import { Debug } from '@/lib/utils';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Important!
export const dynamic = 'force-dynamic'; // Avoid caching
const MAX_DURATION = 250; // seconds

export async function GET() {
  return await setBearerToken(process.env.NEXT_SUPABASE_SERVICE_KEY!, async () => {
    try {
      const supabase = await createClient();

      const { data: jobs, error } = await supabase.rpc('claim_sync_jobs', {
        max_est_duration: MAX_DURATION,
      });

      if (error) {
        throw error.message;
      }
      if (!jobs?.length) {
        throw 'No jobs found';
      }

      for (const job of jobs) {
        await syncJob(job, supabase); // supabase context flows implicitly
      }

      return NextResponse.json({ status: 'started' });
    } catch (err) {
      Debug.error({
        module: '/api/v1/sync-jobs',
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

export const config = {
  runtime: 'nodejs',
  maxDuration: 600, // 10 minutes
};
