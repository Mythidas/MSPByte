'use server';

import { tables } from '../db/index.ts';

export function getRoles() {
  return tables.select('roles');
}
