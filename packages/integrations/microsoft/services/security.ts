import { Tables } from '@/db/schema';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function revokeUserSessions(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>,
  userId: string
): Promise<APIResponse<null>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    await client.data.api(`/users/${userId}/revokeSignInSessions`).post({});

    return { ok: true, data: null };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'revokeUserSessions',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function resetUserPassword(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>,
  userId: string,
  newPassword: string
): Promise<APIResponse<null>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    await client.data.api(`/users/${userId}`).patch({
      passwordProfile: {
        forceChangePasswordNextSignIn: true,
        password: newPassword,
      },
    });

    return { ok: true, data: null };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'resetUserPassword',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function resetUserMFA(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>,
  userId: string
): Promise<APIResponse<null>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    const response = await client.data.api(`/users/${userId}/authentication/methods`).get();
    const methods = response.value as { id: string; '@odata.type': string }[];

    for (const method of methods) {
      if (method.id && !method['@odata.type'].includes('passwordAuthenticationMethod')) {
        const methodType =
          method['@odata.type'].split('.').at(-1)?.split('AuthenticationMethod')[0] + 'Methods';
        await client.data
          .api(`/users/${userId}/authentication/${methodType}/${method.id}`)
          .delete();
      }
    }

    return { ok: true, data: null };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'resetUserMFA',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function checkInboxRules(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>,
  userId: string,
  email: string
) {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    const response = await client.data.api(`/users/${userId}/mailFolders/inbox/messageRules`).get();

    const rules = response.value;
    const suspicious = parseSuspiciousInboxRules(rules);

    return {
      ok: true,
      data: {
        email,
        userId,
        rules: suspicious,
      },
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getInboxRules',
      message: `${email}: ${String(err)}`,
      time: new Date(),
    });
  }
}

type ParsedRule = {
  id: string;
  name: string;
  actions: string[];
  description: string;
};

function parseSuspiciousInboxRules(rules: any[]): ParsedRule[] {
  const suspiciousRules: ParsedRule[] = [];

  for (const rule of rules) {
    const { id, displayName, actions } = rule;
    const flags: string[] = [];

    if (!actions) continue;

    if (
      (actions.forwardTo && actions.forwardTo?.length) ||
      (actions.forwardAsAttachmentTo && actions.forwardAsAttachmentTo?.length)
    ) {
      flags.push('forwards mail');
    }

    if (actions.redirectTo?.length) {
      flags.push('redirects mail');
    }

    if (actions.delete) {
      flags.push('deletes mail');
    }

    if (actions.moveToFolder) {
      flags.push(`moves mail to folder "${actions.moveToFolder}"`);
    }

    if (flags.length > 0) {
      suspiciousRules.push({
        id,
        name: displayName || '(unnamed rule)',
        actions: Object.keys(actions).filter((k) => actions[k]),
        description: flags.join(', '),
      });
    }
  }

  return suspiciousRules;
}
