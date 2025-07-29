import { Tables } from '@/db/schema';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphUserSignInLog } from '@/integrations/microsoft/types/activity';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import Papa from 'papaparse';

export async function getRecentSignIns(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>
): Promise<APIResponse<Record<string, string>>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    const signInMap: Record<string, string> = {};
    try {
      const response = await client.data
        .api('/auditLogs/signIns')
        .select('userPrincipalName,createdDateTime,appDisplayName,status')
        .top(100)
        .get();

      const logs = response.value as MSGraphUserSignInLog[];

      for (const log of logs) {
        const upn = log.userPrincipalName;
        if (!upn) continue;

        const existing = signInMap[upn as string];
        const currentTime = new Date(log.createdDateTime ?? 0).getTime();
        const existingTime = new Date(existing ?? 0).getTime();

        if (!existing || currentTime > existingTime) {
          signInMap[upn] = log.createdDateTime;
        }
      }
    } catch {
      const stream = await client.data
        .api("/reports/getEmailActivityUserDetail(period='D30')")
        .get();

      if (!stream) {
        throw new Error('No response body to read.');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) {
          result += decoder.decode(value, { stream: !doneReading });
        }
        done = doneReading;
      }

      // Now parse the result as CSV
      const parsed = Papa.parse<{ 'User Principal Name': string; 'Last Activity Date': string }>(
        result,
        {
          header: true,
          skipEmptyLines: true,
        }
      );

      if (parsed.errors.length > 0) {
        throw new Error(`CSV parse errors: ${parsed.errors.map((e) => e.message).join(', ')}`);
      }

      for (const log of parsed.data) {
        const upn = log['User Principal Name'];
        if (!upn) continue;

        const existing = signInMap[upn as string];
        const currentTime = new Date(log['Last Activity Date'] ?? 0).getTime();
        const existingTime = new Date(existing ?? 0).getTime();

        if (!existing || currentTime > existingTime) {
          signInMap[upn] = log['Last Activity Date'];
        }
      }
    }

    return {
      ok: true,
      data: signInMap,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getRecentSignIns',
      message: String(err),
      time: new Date(),
    });
  }
}
