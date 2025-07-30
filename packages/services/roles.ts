'use server';

import { PaginationOptions } from '@/types/db';
import { tables } from 'packages/db';

export async function getRoles(pagination?: PaginationOptions) {
  return tables.select('roles', undefined, pagination);
}
