'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { syncSource } from '@/core/syncSource';
import { Tables } from '@/db/schema';
import { getSites } from '@/services/sites';
import { getSourceTenants } from '@/services/source/tenants';
import { toast } from 'sonner';

type Props = {
  type: 'global' | 'parent' | 'site';
  sourceId: string;
  site?: Tables<'sites'>;
  button?: boolean;
};

export default function SyncSourceItem({ type, sourceId, site, button }: Props) {
  const handleSync = async () => {
    try {
      switch (type) {
        case 'global': {
          const mappings = await getSourceTenants(sourceId);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(sourceId, mappings.data[0].tenant_id, [
            ...mappings.data.map((s) => s.site_id),
          ]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'parent': {
          const sites = await getSites(site!.id);
          if (!sites.ok) {
            throw new Error(sites.error.message);
          }

          const mappings = await getSourceTenants(sourceId, [
            site!.id,
            ...sites.data.map((s) => s.id),
          ]);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(sourceId, site!.tenant_id, [
            ...mappings.data.map((s) => s.site_id),
          ]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'site': {
          const jobs = await syncSource(sourceId, site!.tenant_id, [site!.id]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
      }
    } catch (err) {
      toast.error(`Failed to sync: ${err}`);
    }
  };

  if (button)
    return (
      <Button variant="secondary" onClick={handleSync}>
        Sync Now
      </Button>
    );
  return <DropdownMenuItem onClick={handleSync}>Sync Now</DropdownMenuItem>;
}
