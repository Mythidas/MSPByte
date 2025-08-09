'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import SophosMappingsDialog from '@/components/domain/integrations/sophos/SophosMappingsDialog';
import { Tables } from '@/types/db';
import { TrendingUp, Users, Zap, ExternalLink, Database, Building, Eye } from 'lucide-react';
import { useAsync } from '@/hooks/common/useAsync';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getRowsCount } from '@/db/orm';

type Props = {
  source: Tables<'public', 'sources'>;
  integration: Tables<'public', 'integrations'>;
};

export default function SophosPartnerEnabled({ source, integration }: Props) {
  return (
    <div className="grid gap-2">
      {/* Top Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <TotalDevicesCard sourceId={source.id} />
        <MonthlyUsageCard sourceId={source.id} />
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <QuickActionsCard source={source} integration={integration} />
        </div>
        <div>
          <SiteSummaryCard sourceId={source.id} />
        </div>
      </div>
    </div>
  );
}

function SiteSummaryCard({ sourceId }: { sourceId: string }) {
  const {
    data: { total, connected },
  } = useAsync({
    initial: { total: 0, connected: 0 },
    fetcher: async () => {
      const siteCount = await getRowsCount('public', 'sites');
      const tenantsCount = await getRowsCount('source', 'tenants', {
        filters: [['source_id', 'eq', sourceId]],
      });

      if (!siteCount.ok || !tenantsCount.ok) {
        throw 'Failed to fetch correct counts. Please refresh.';
      }

      return { total: siteCount.data, connected: tenantsCount.data };
    },
    deps: [],
  });

  return (
    <Card>
      <CardHeader>
        <span className="flex gap-2 items-center">
          <Building className="w-4 h-4" />
          Site Summary
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex w-full justify-between items-center">
          Connected <Badge>{connected}</Badge>
        </div>
        <div className="flex w-full justify-between items-center">
          Not Configured <Badge variant="secondary">{total - connected}</Badge>
        </div>
        <Separator />
        <Button variant="secondary" asChild>
          <Link href={`/${sourceId}/tenants`}>
            <Eye /> View All Sites
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickActionsCard({
  source,
  integration,
}: {
  source: Tables<'public', 'sources'>;
  integration: Tables<'public', 'integrations'>;
}) {
  return (
    <Card>
      <CardHeader>
        <span className="flex gap-2 items-center">
          <Zap className="w-4 h-4" />
          Actions
        </span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <SophosMappingsDialog source={source} integration={integration} />
        <Button className="justify-start" variant="secondary" disabled>
          <ExternalLink />
          Documentation
        </Button>
        <Button className="justify-start" variant="secondary">
          <Database />
          Sync Endpoints
        </Button>
      </CardContent>
    </Card>
  );
}

function MonthlyUsageCard({ sourceId }: { sourceId: string }) {
  const {
    data: { connected },
    isLoading,
  } = useAsync({
    initial: { connected: 0 },
    fetcher: async () => {
      const tenantsCount = await getRowsCount('source', 'tenants', {
        filters: [['source_id', 'eq', sourceId]],
      });

      if (!tenantsCount.ok) {
        throw 'Failed to fetch correct counts. Please refresh.';
      }

      return { connected: tenantsCount.data };
    },
    deps: [],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          Monthly Usage
          <CardAction>
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-1/3 h-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        Monthly Usage
        <CardAction>
          <TrendingUp className="w-6 h-6 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col">
        <span className="text-xl font-bold">${connected * 10}</span>
        <span className="text-sm text-muted-foreground">$10 per site</span>
      </CardContent>
    </Card>
  );
}

function TotalDevicesCard({ sourceId }: { sourceId: string }) {
  const {
    data: { devices },
    isLoading,
  } = useAsync({
    initial: { devices: 0 },
    fetcher: async () => {
      const devices = await getRowsCount('source', 'devices', {
        filters: [['source_id', 'eq', sourceId]],
      });

      if (devices.ok) {
        return { devices: devices.data };
      }

      return { devices: 0 };
    },
    deps: [],
  });

  return (
    <Card>
      <CardHeader>
        Total Devices
        <CardAction>
          <Users className="w-6 h-6 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent className={cn('flex flex-col', isLoading && 'gap-2')}>
        {isLoading ? (
          <>
            <span className="text-xl font-bold">
              <Skeleton className="w-6 h-6" />
            </span>
            <Skeleton className="w-full h-3" />
          </>
        ) : (
          <>
            <span className="text-xl font-bold">{devices}</span>
            <span className="text-sm text-muted-foreground">Across all endpoints</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}
