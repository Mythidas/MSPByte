'use server';

import { Debug } from '../../utils.ts';
import { tables } from '../db/index.ts';
import { TablesUpdate } from '../db/schema.ts';

export function getSourceIntegrations() {
  return tables.select('source_integrations');
}

export function getSourceIntegrationsView() {
  return tables.select('source_integrations_view');
}

export function getSourceIntegration(id?: string, sourceId?: string) {
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

export function updateSourceIntegration(
  id: string,
  integration: TablesUpdate<'source_integrations'>
) {
  return tables.update('source_integrations', id, integration);
}
