import { getSiteSourceMapping } from '../../../services/siteSourceMappings.ts';

export async function getGraphToken(sourceId: string, siteId: string) {
  const mapping = await getSiteSourceMapping(sourceId, siteId);
  if (!mapping.ok) {
    throw new Error(mapping.error.message);
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${mapping.data.external_id}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: (mapping.data.metadata as any).client_id,
        client_secret: (mapping.data.metadata as any).client_secret,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${data.error_description || data.error}`);
  return data.access_token as string;
}

export async function graphFetch(endpoint: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0/${endpoint}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph error: ${res.status} ${err}`);
  }

  return res.json();
}
