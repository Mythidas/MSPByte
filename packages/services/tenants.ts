import { tables } from 'packages/db';

export async function getTenant() {
  return tables.selectSingle('tenants');
}
