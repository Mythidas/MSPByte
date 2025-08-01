import { Tables } from '@/db/schema';
import { createClient } from '@/db/server';
import { Debug, Timer } from '@/lib/utils';
import { APIResponse } from '@/types';

type SyncContext = {
  state: Record<string, string | null>;
  sync_id: string;
  tenant_id: string;
  source_id: string;
  site_id: string;
  getState: (name: string) => string | undefined;
  setState: (name: string, value: string | undefined) => void;
};

type SyncStep<TInput = any, TOutput = any> = (
  ctx: SyncContext,
  input: TInput
) => Promise<APIResponse<TOutput>>;
type FinalHandler = (ctx: SyncContext) => Promise<void>;

export default class SyncChain<TInput = null> {
  private steps: SyncStep[] = [];
  private finalSteps: FinalHandler[] = [];
  private ctx: SyncContext;

  constructor(ctx: SyncContext) {
    this.ctx = {
      ...ctx,
      getState: (name) => (this.ctx.state as Record<string, string>)[name],
      setState: (name, value) =>
        ((this.ctx.state as Record<string, string | undefined>)[name] = value),
    };
  }

  step<TOutput>(name: string, fn: SyncStep<TInput, TOutput>): SyncChain<TOutput> {
    this.steps.push(async (ctx, input) => {
      const timer = new Timer(name, true);
      const result = await fn(ctx, input);
      timer.summary();
      return result;
    });
    return new SyncChain<TOutput>(this.ctx)._withSteps(this.steps);
  }

  private _withSteps(steps: SyncStep<any, any>[]): this {
    this.steps = steps;
    return this;
  }

  final(fn: FinalHandler) {
    this.finalSteps.push(fn);
    return this;
  }

  async run() {
    let result: APIResponse<any> = { ok: true, data: null };
    for (const step of this.steps) {
      if (!result.ok) {
        await this.fail(result.error.message);
        return;
      }

      result = await step(this.ctx, result.data);
    }

    const finished = Object.values(this.ctx.state).every((v) => v === null || v === undefined);
    const supabase = await createClient();
    const completed = new Date().toISOString();
    await supabase
      .from('source_sync_jobs')
      .update({
        completed_at: completed,
        state: this.ctx.state,
        status: finished ? 'completed' : 'pending',
      })
      .eq('id', this.ctx.sync_id);

    if (finished) {
      await supabase
        .from('source_tenants')
        .update({
          last_sync: completed,
        })
        .eq('id', this.ctx.tenant_id);

      for (const fn of this.finalSteps) {
        await fn(this.ctx);
      }
    }
  }

  private async fail(error: string) {
    const supabase = await createClient();
    await supabase
      .from('source_sync_jobs')
      .update({
        last_attempt_at: new Date().toISOString(),
        status: 'failed',
      })
      .eq('id', this.ctx.sync_id);
  }
}
