'use server';

import { tables } from '@/db';
import { TablesUpdate } from '@/db/schema';
import { Debug } from '@/lib/utils';

export async function getSourceIntegrations() {
  return tables.select('source_integrations');
}

export async function getSourceIntegrationsView() {
  return tables.select('source_integrations_view');
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

export async function updateSourceIntegration(
  id: string,
  integration: TablesUpdate<'source_integrations'>
) {
  return tables.update('source_integrations', id, integration);
}
