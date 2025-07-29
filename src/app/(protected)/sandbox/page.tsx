'use client';

import Loader from '@/components/shared/Loader';
import SearchBox from '@/components/shared/SearchBox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRows, insertRows } from '@/db/orm';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { testSyncJob } from '@/lib/actions/sandbox';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const [selectedTenant, setSelectedTenant] = useState('');

  const { content: TenantSearchBar } = useLazyLoad({
    fetcher: async () => {
      const tenants = await getRows('source_tenants_view');
      if (tenants.ok) return tenants.data.rows;
    },
    render: (data) => {
      if (!data) return <strong>Failed to find tenants</strong>;

      const handleClick = async () => {
        const tenant = data.find((t) => t.id === selectedTenant)!;

        const job = await insertRows('source_sync_jobs', {
          rows: [
            {
              tenant_id: tenant.tenant_id!,
              site_id: tenant.site_id!,
              source_id: tenant.source_id!,
              source_tenant_id: tenant.id!,
              status: 'running',
            },
          ],
        });
        if (job.ok) {
          testSyncJob(job.data[0].id);
          toast.info('Job started');
        }
      };

      return (
        <Label className="grid gap-2">
          Tenant
          <SearchBox
            options={data.map((tenant) => {
              return { label: `${tenant.site_name}: ${tenant.source_id}`, value: tenant.id! };
            })}
            onSelect={setSelectedTenant}
          />
          <Button onClick={handleClick}>Test Sync</Button>
        </Label>
      );
    },
    skeleton: () => <Loader />,
  });

  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-bold">Sandbox</h1>
      <Tabs defaultValue="sync_job">
        <TabsList>
          <TabsTrigger value="sync_job">Job Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="sync_job">{TenantSearchBar}</TabsContent>
      </Tabs>
    </div>
  );
}
