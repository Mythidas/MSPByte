'use client';

import Display from '@/components/shared/Display';
import { LazyTabContent } from '@/components/shared/LazyTabsContent';
import Loader from '@/components/shared/Loader';
import RouteTabsTrigger from '@/components/shared/secure/RouteTabsTrigger';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { getRows } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Building } from 'lucide-react';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function AutotaskEnabled({ source }: Props) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <RouteTabsTrigger value="overview">Overview</RouteTabsTrigger>
      </TabsList>

      <LazyTabContent value="overview">
        <div className="grid grid-cols-3 gap-2">
          <AutoTaskSitesCard sourceId={source.id} />
        </div>
      </LazyTabContent>
    </Tabs>
  );
}

function AutoTaskSitesCard({ sourceId }: { sourceId: string }) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      const sites = await getRows('source_sites_view', {
        filters: [['source_id', 'eq', sourceId]],
      });

      if (sites.ok) {
        return sites.data.rows;
      }
    },
    render: (data) => {
      if (!data) return null;

      return (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Sites
              </div>
            </CardTitle>
            <CardAction>{data.length}</CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-2">
            <Display>
              <div className="flex w-full justify-between">
                <span>Mapped Sites</span>
                <span>{data.filter((site) => !!site.source_tenant_id).length}</span>
              </div>
            </Display>
            <Display>
              <div className="flex w-full justify-between">
                <span>Missing Sites</span>
                <span>{data.filter((site) => !site.source_tenant_id).length}</span>
              </div>
            </Display>
          </CardContent>
        </Card>
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
