'use server';

import { tables } from 'packages/db';

export async function getRoles() {
  return tables.select('roles');
}
