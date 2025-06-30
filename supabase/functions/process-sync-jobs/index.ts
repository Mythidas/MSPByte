// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { syncJob } from './packages/core/syncJob.ts';
import { createClient } from './packages/db/server.ts';
import { setAuthToken } from './utils.ts';
const MAX_DURATION = 200;
Deno.serve(async (req) => {
  try {
    setAuthToken(req.headers.get('Authorization') || '');
    const supabase = createClient();
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
      const result = await syncJob(job);
      console.log(`[${job.id}] Result: ${result.ok}`);
      if (result.ok) {
        await supabase
          .from('source_sync_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      } else {
        await supabase
          .from('source_sync_jobs')
          .update({
            status: 'failed',
            error: String(result.error.message),
            retry_count: (job.retry_count ?? 0) + 1,
            last_attemt_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      }
    }
    return new Response('Jobs processed');
    // deno-lint-ignore no-explicit-any
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        message: err?.message ?? err,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
