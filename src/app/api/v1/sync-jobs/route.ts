// app/api/sync-job.ts
import { syncJob } from '@/core/syncJob';
import { createAdminClient } from '@/db/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Important!
export const dynamic = 'force-dynamic'; // Avoid caching
const MAX_DURATION = 250; // seconds

export async function POST() {
  try {
    const supabase = await createAdminClient();
    const { data: jobs, error } = await supabase.rpc('claim_sync_jobs', {
      max_est_duration: MAX_DURATION,
    });
    if (error) {
      throw error.message;
    }
    if (!jobs?.length) {
      return new Response('No jobs found');
    }
    for (const job of jobs) {
      syncJob(job, supabase);
    }
    return NextResponse.json({ status: 'started' });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: String(err),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 600, // 10 minutes
};
