import { Tables } from '@/db/schema';
import { syncMicrosoft365 } from '@/integrations/microsoft/sync';
import { syncSophosPartner } from '@/integrations/sophos/sync';
import { Debug } from '@/lib/utils';
import { getSource } from '@/services/sources';
import { APIResponse } from '@/types';

export async function syncSource(
  integration: Tables<'source_integrations'>,
  siteIds?: string[]
): Promise<APIResponse<null>> {
  try {
    const source = await getSource(integration.source_id);

    if (!source.ok) {
      throw new Error(source.error.message);
    }

    switch (source.data.slug) {
      case 'sophos-partner':
        return await syncSophosPartner(integration, siteIds);
      case 'microsoft-365':
        return await syncMicrosoft365(integration, siteIds);
      default:
        throw new Error('No sync defined for this source');
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-integration',
      message: String(err),
      time: new Date(),
    });
  }
}
