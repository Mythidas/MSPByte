'use server';

import { tables } from '../db/index.ts';

export function getSources() {
  return tables.select('sources');
}

export function getSource(id?: string) {
  return tables.selectSingle('sources', (query) => {
    if (id) query = query.eq('id', id);
  });
}
