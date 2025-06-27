import { tables } from '../db/index.ts';

export function getTenant() {
  return tables.selectSingle('tenants');
}
