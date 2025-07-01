'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { syncSource } from '@/core/sync';
import { Tables } from '@/db/schema';
import { getSites } from '@/services/sites';
import { getSiteSourceMappings } from '@/services/siteSourceMappings';
import { toast } from 'sonner';

type Props = {
  type: 'global' | 'parent' | 'site';
  sourceId: string;
  site?: Tables<'sites'>;
};

export default function SyncSourceItem({ type, sourceId, site }: Props) {
  const handleSync = async () => {
    console.log(type, sourceId, site);
    try {
      switch (type) {
        case 'global': {
          const mappings = await getSiteSourceMappings(sourceId);
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

          const mappings = await getSiteSourceMappings(sourceId, [
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

  return <DropdownMenuItem onClick={handleSync}>Sync Now</DropdownMenuItem>;
}
