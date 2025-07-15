import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getGraphClient(
  tenantId: string,
  clientId: string,
  clientSecret: string
): Promise<APIResponse<Client>> {
  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

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
