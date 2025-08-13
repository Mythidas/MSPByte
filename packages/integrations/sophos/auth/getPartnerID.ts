import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getPartnerID(token: string): Promise<APIResponse<string>> {
  try {
    const response = await fetch('https://api.central.sophos.com/whoami/v1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Sophos Partner ID: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      data: data.id as string,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-partner-id',
      message: String(err),
    });
  }
}
