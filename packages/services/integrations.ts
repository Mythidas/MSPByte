'use server';

import { tables } from '@/db';
import { TablesInsert, TablesUpdate } from '@/types/db';
import { Debug } from '@/lib/utils';

export async function getSourceIntegrations() {
  return tables.select('public', 'integrations');
}

export async function getSourceIntegrationsView() {
  return tables.select('public', 'integrations_view');
}

export async function getSourceIntegrationView(sourceId: string) {
  return tables.selectSingle('public', 'integrations_view', (query) => {
    query = query.eq('source_id', sourceId);
  });
}

export async function getSourceIntegration(id?: string, sourceId?: string) {
  if (!id && !sourceId) {
    return Debug.error({
      module: 'integrations',
      context: 'getIntegration',
      message: 'At least one parameter required',
      time: new Date(),
    });
  }
  return tables.selectSingle('public', 'integrations', (query) => {
    if (id) query = query.eq('id', id);
    if (sourceId) query = query.eq('source_id', sourceId);
  });
}

export async function putSourceIntegrations(rows: TablesInsert<'public', 'integrations'>[]) {
  return tables.insert('public', 'integrations', rows);
}

export async function updateSourceIntegration(
  id: string,
  integration: TablesUpdate<'public', 'integrations'>
) {
  return tables.update('public', 'integrations', id, integration);
}

export async function deleteSourceIntegrations(ids: string[]) {
  return tables.delete('public', 'integrations', (query) => {
    query = query.in('id', ids);
  });
}
