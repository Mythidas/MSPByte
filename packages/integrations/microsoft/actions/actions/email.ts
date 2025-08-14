'use server';

import { getRow, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import {
  checkInboxRules,
  resetUserMFA,
  resetUserPassword,
  revokeUserSessions,
} from '@/integrations/microsoft/actions/security';

export default async function microsoft365EmailBreachResponse(
  feed: Tables<'public', 'activity_feeds'>,
  identities: Tables<'source', 'identities'>[],
  password: string
) {
  if (!feed.site_id) return;
  const tenant = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', 'microsoft-365'],
      ['site_id', 'eq', feed.site_id],
    ],
  });
  if (tenant.error) return;

  // Revoke Sessions
  const revokeSessions = await Promise.all(
    identities.map(async (id) => await revokeUserSessions(tenant.data, id.external_id))
  );
  if (revokeSessions.every((session) => !session.error)) {
    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            revoke_sessions: {
              status: 'completed',
            },
            reset_password: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  } else {
    const errors = revokeSessions.map((e) => {
      if ('error' in e) {
        return e.error?.message;
      }

      return undefined;
    });

    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            revoke_sessions: {
              status: 'error',
              errors,
            },
            reset_password: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  }

  // Reset Passwords
  const resetPasswords = await Promise.all(
    identities.map(async (id) => await resetUserPassword(tenant.data, id.external_id, password))
  );
  if (resetPasswords.every((session) => !session.error)) {
    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            reset_password: {
              status: 'completed',
            },
            reset_mfa: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  } else {
    const errors = resetPasswords.map((e) => {
      if ('error' in e) {
        return e.error?.message;
      }

      return undefined;
    });

    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            reset_password: {
              status: 'error',
              errors,
            },
            reset_mfa: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  }

  // Reset MFA
  const resetMFA = await Promise.all(
    identities.map(async (id) => await resetUserMFA(tenant.data, id.external_id))
  );
  if (resetMFA.every((session) => !session.error)) {
    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            reset_mfa: {
              status: 'completed',
            },
            check_inbox_rules: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  } else {
    const errors = resetMFA.map((e) => {
      if ('error' in e) {
        return e.error?.message;
      }

      return undefined;
    });

    const update = await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            reset_mfa: {
              status: 'error',
              errors,
            },
            check_inbox_rules: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (!update.error) feed = update.data;
  }

  // Check Inbox Rules
  const checkRules = await Promise.all(
    identities.map(async (id) => await checkInboxRules(tenant.data, id.external_id, id.email))
  );
  if (checkRules.every((session) => !session.error)) {
    await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        status: 'completed',
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            check_inbox_rules: {
              status: 'completed',
              data: checkRules.map((rule) => (rule.error ? rule.data : undefined)),
            },
          },
        },
      },
    });
  } else {
    const errors = checkRules.map((e) => {
      if ('error' in e) {
        return e.error?.message;
      }

      return undefined;
    });

    await updateRow('public', 'activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        status: 'error',
        metadata: {
          ...(feed.metadata as any),
          steps: {
            ...(feed.metadata as any).steps,
            check_inbox_rules: {
              status: 'error',
              data: checkRules.map((rule) => (rule.error ? rule.data : undefined)).filter(Boolean),
              errors,
            },
          },
        },
      },
    });
  }
}
