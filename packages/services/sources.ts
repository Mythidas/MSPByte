'use server';

import { tables } from 'packages/db';

export async function getSources() {
  return tables.select('sources');
}

export async function getSource(id?: string, slug?: string) {
  return tables.selectSingle('sources', (query) => {
    if (id) query = query.eq('id', id);
    if (slug) query = query.eq('slug', slug);
  });
}
