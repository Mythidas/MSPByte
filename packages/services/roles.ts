'use server';

import { PaginationOptions } from '@/types/data-table';
import { tables } from 'packages/db';

export async function getRoles(pagination?: PaginationOptions) {
  return tables.select('roles', undefined, pagination);
}
