'use server';

import { tables } from 'packages/db';

export async function getUsers() {
  return tables.select('users');
}

export async function getUser(id: string) {
  return tables.selectSingle('users', (query) => {
    query = query.eq('id', id);
  });
}

export async function getInvites() {
  return tables.select('invites');
}
