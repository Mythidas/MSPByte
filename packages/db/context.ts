// packages/db/context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

const bearerContext = new AsyncLocalStorage<string>();

export const setBearerToken = (token: string, fn: () => Promise<any>) =>
  bearerContext.run(token, fn);

export const getBearerToken = () => bearerContext.getStore();
