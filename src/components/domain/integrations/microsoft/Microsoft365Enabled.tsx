'use client';

import Microsoft365MappingsDialog from '@/components/domain/integrations/microsoft/Microsoft365MappingsDialog';
import SyncSourceItem from '@/components/domain/sources/SyncSourceItem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/db/schema';
import { useAsync } from '@/hooks/common/useAsync';
import { cn } from '@/lib/utils';
import { getSourceIdentitiesCount } from '@/services/identities';
import { getSitesCount } from '@/services/sites';
import { getSourceTenantsCount } from '@/services/source/tenants';
import { Building, Database, ExternalLink, Eye, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function Microsoft365Enabled({ source, integration }: Props) {
  return (
    <div className="grid gap-2">
      {/* Top Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <TotalIdentitiesCard sourceId={source.id} />
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
      const siteCount = await getSitesCount();
      const tenantsCount = await getSourceTenantsCount(sourceId);

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

function QuickActionsCard({ source, integration }: Props) {
  return (
    <Card>
      <CardHeader>
        <span className="flex gap-2 items-center">
          <Zap className="w-4 h-4" />
          Actions
        </span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Microsoft365MappingsDialog sourceId={source.id} onSave={() => window.location.reload()} />
        <Button className="justify-start" variant="secondary" disabled>
          <ExternalLink />
          Documentation
        </Button>
        <SyncSourceItem
          type="global"
          sourceId={source.id}
          tenantId={integration.tenant_id}
          className="justify-start"
        >
          <Database />
          Sync All Sites
        </SyncSourceItem>
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
      const tenantsCount = await getSourceTenantsCount(sourceId);

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

function TotalIdentitiesCard({ sourceId }: { sourceId: string }) {
  const {
    data: { connected },
    isLoading,
  } = useAsync({
    initial: { connected: 0 },
    fetcher: async () => {
      const identities = await getSourceIdentitiesCount(sourceId);

      if (!identities.ok) {
        throw 'Failed to fetch correct counts. Please refresh.';
      }

      return { connected: identities.data };
    },
    deps: [],
  });

  return (
    <Card>
      <CardHeader>
        Total Identities
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
            <span className="text-xl font-bold">{connected}</span>
            <span className="text-sm text-muted-foreground">Across all sites</span>
          </>
        )}
      </CardContent>
    </Card>
  );
}
