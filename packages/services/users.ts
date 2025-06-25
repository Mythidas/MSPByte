'use server';

import { TablesUpdate } from '@/db/schema';
import { tables } from 'packages/db';

export async function getUsers() {
  return tables.select('users');
}

export async function getUser(id: string) {
  return tables.selectSingle('users', (query) => {
    query = query.eq('id', id);
  });
}

export async function updateUser(id: string, row: TablesUpdate<'users'>) {
  return tables.update('users', id, row);
}
