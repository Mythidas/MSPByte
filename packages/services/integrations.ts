'use server';

import { tables } from '@/db';
import { TablesInsert, TablesUpdate } from '@/db/schema';
import { Debug } from '@/lib/utils';

export async function getSourceIntegrations() {
  return tables.select('source_integrations');
}

export async function getSourceIntegrationsView() {
  return tables.select('source_integrations_view');
}

export async function getSourceIntegrationView(sourceId: string) {
  return tables.selectSingle('source_integrations_view', (query) => {
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
  return tables.selectSingle('source_integrations', (query) => {
    if (id) query = query.eq('id', id);
    if (sourceId) query = query.eq('source_id', sourceId);
  });
}

export async function putSourceIntegrations(rows: TablesInsert<'source_integrations'>[]) {
  return tables.insert('source_integrations', rows);
}

export async function updateSourceIntegration(
  id: string,
  integration: TablesUpdate<'source_integrations'>
) {
  return tables.update('source_integrations', id, integration);
}

export async function deleteSourceIntegrations(ids: string[]) {
  return tables.delete('source_integrations', ids);
}
