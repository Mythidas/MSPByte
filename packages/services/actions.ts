'use server';

import { updateRow } from '@/db/orm';
import { Tables } from '@/db/schema';
import {
  checkInboxRules,
  resetUserMFA,
  resetUserPassword,
  revokeUserSessions,
} from '@/integrations/microsoft/services/security';
import { getSourceTenant } from '@/services/source/tenants';

export default async function microsoft365EmailBreachResponse(
  feed: Tables<'activity_feeds'>,
  identities: Tables<'source_identities'>[],
  password: string
) {
  if (!feed.site_id) return;
  const tenant = await getSourceTenant('microsoft-365', feed.site_id);
  if (!tenant.ok) return;

  // Revoke Sessions
  const revokeSessions = await Promise.all(
    identities.map(async (id) => await revokeUserSessions(tenant.data, id.external_id))
  );
  if (revokeSessions.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  } else {
    const errors = revokeSessions.map((e) => {
      if ('error' in e) {
        return e.error.message;
      }

      return undefined;
    });

    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  }

  // Reset Passwords
  const resetPasswords = await Promise.all(
    identities.map(async (id) => await resetUserPassword(tenant.data, id.external_id, password))
  );
  if (resetPasswords.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  } else {
    const errors = resetPasswords.map((e) => {
      if ('error' in e) {
        return e.error.message;
      }

      return undefined;
    });

    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  }

  // Reset MFA
  const resetMFA = await Promise.all(
    identities.map(async (id) => await resetUserMFA(tenant.data, id.external_id))
  );
  if (resetMFA.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  } else {
    const errors = resetMFA.map((e) => {
      if ('error' in e) {
        return e.error.message;
      }

      return undefined;
    });

    const update = await updateRow('activity_feeds', {
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
    if (update.ok) feed = update.data;
  }

  // Check Inbox Rules
  const checkRules = await Promise.all(
    identities.map(async (id) => await checkInboxRules(tenant.data, id.external_id, id.email))
  );
  if (checkRules.every((session) => session.ok)) {
    await updateRow('activity_feeds', {
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
              data: checkRules.map((rule) => (rule.ok ? rule.data : undefined)),
            },
          },
        },
      },
    });
  } else {
    const errors = checkRules.map((e) => {
      if ('error' in e) {
        return e.error.message;
      }

      return undefined;
    });

    await updateRow('activity_feeds', {
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
              data: checkRules.map((rule) => (rule.ok ? rule.data : undefined)).filter(Boolean),
              errors,
            },
          },
        },
      },
    });
  }
}
