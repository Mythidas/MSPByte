'use server';

import { Tables } from '@/db/schema';
import { createClient } from '@/db/server';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getToken(
  integration: Tables<'source_integrations'>
): Promise<APIResponse<string>> {
  try {
    if (integration.token) {
      const expiration = new Date(integration.token_expiration || 0);
      const expired = expiration.getTime() - new Date().getTime() <= 1000 * 1000 * 5 * 60;

      if (!expired)
        return {
          ok: true,
          data: integration.token,
        };
    }

    const clientId = (integration.config as Record<string, string>)['client_id'];
    const clientSecret = (integration.config as Record<string, string>)['client_secret'];
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'token',
    });

    const response = await fetch('https://id.sophos.com/api/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Sophos token: ${response.status} - ${error}`);
    }
    const data = await response.json();

    const supabase = await createClient();
    await supabase
      .from('source_integrations')
      .update({
        token: data.access_token,
        token_expiration: new Date(new Date().getTime() + data.expires_in * 1000).toISOString(),
      })
      .eq('id', integration.id);

    return {
      ok: true,
      data: data.access_token as string,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'getToken',
      message: String(err),
      time: new Date(),
    });
  }
}
