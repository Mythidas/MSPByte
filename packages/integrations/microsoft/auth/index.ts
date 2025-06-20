import { Debug } from '@/lib/utils';
import { getSiteSourceMapping } from '@/services/siteSourceMappings';
import { APIResponse } from '@/types';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getGraphClient(
  sourceId: string,
  siteId: string
): Promise<APIResponse<Client>> {
  try {
    const mapping = await getSiteSourceMapping(sourceId, siteId);
    if (!mapping.ok) {
      throw new Error(mapping.error.message);
    }

    const credential = new ClientSecretCredential(
      mapping.data.external_id,
      (mapping.data.metadata as any).client_id,
      (mapping.data.metadata as any).client_secret
    );

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse?.token!;
        },
      },
    });

    return {
      ok: true,
      data: client,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'getGraphClient',
      message: String(err),
      time: new Date(),
    });
  }
}
