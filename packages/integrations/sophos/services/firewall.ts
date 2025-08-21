'use server';

import { Tables } from '@/types/db';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { SPFirewall } from '@/integrations/sophos/types/firewall';

export async function getFirewalls(
  token: string,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<SPFirewall[]>> {
  try {
    if (!token) {
      throw new Error('Invalid token input');
    }

    const path = '/firewall/v1/firewalls';
    const metadata = mapping.metadata as Record<string, any>;
    const url = metadata.apiHost + path;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': mapping.external_id,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    if (data.items && data.items.length) {
      const response = await fetch(url + '/actions/firmware-upgrade-check', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-ID': mapping.external_id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewalls: data.items.map((fw: SPFirewall) => fw.id),
        }),
      });

      const firmwares = await response.json();
      if (firmwares.firewalls && firmwares.firewalls.length) {
        for (const check of firmwares.firewalls) {
          const firewall = data.items.find((fw: SPFirewall) => fw.id === check.id);
          if (firewall) {
            firewall.firmware = { ...check, newestFirmware: check.upgradeToVersion[0] || '' };
          }
        }
      }
    }

    return {
      data: [...data.items],
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'getEndpoints',
      message: String(err),
    });
  }
}

export async function scheduleFirewallUpgrade(
  token: string,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<SPFirewall[]>> {
  try {
    if (!token) {
      throw new Error('Invalid token input');
    }

    const path = '/firewall/v1/firewalls';
    const metadata = mapping.metadata as Record<string, any>;
    const url = metadata.apiHost + path;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': mapping.external_id,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    if (data.items && data.items.length) {
      const response = await fetch(url + '/actions/firmware-upgrade-check', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-ID': mapping.external_id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firewalls: data.items.map((fw: SPFirewall) => fw.id),
        }),
      });

      const firmwares = await response.json();
      if (firmwares.firewalls && firmwares.firewalls.length) {
        for (const check of firmwares.firewalls) {
          const firewall = data.items.find((fw: SPFirewall) => fw.id === check.id);
          if (firewall) {
            firewall.firmware = { ...check, newestFirmware: check.upgradeToVersion[0] || '' };
          }
        }
      }
    }

    return {
      data: [...data.items],
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'getEndpoints',
      message: String(err),
    });
  }
}
