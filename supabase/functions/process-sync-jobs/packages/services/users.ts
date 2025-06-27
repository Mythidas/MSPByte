'use server';

import { tables } from '../db/index.ts';
import { TablesUpdate } from '../db/schema.ts';

export function getUsers() {
  return tables.select('users');
}

export function getUser(id: string) {
  return tables.selectSingle('users', (query) => {
    query = query.eq('id', id);
  });
}

export function updateUser(id: string, row: TablesUpdate<'users'>) {
  return tables.update('users', id, row);
}
