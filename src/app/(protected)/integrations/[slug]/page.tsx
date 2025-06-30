'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SophosPartner from '@/components/domains/sophos/SophosPartner';
import { Badge } from '@/components/ui/badge';
import { getSource } from 'packages/services/sources';
import { getSourceIntegration } from 'packages/services/integrations';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Microsoft365 from '@/components/domains/microsoft/Microsoft365';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAsync } from '@/hooks/useAsync';
import { Spinner } from '@/components/common/Spinner';
import { Tables } from '@/db/schema';

export default function Page() {
  const params = useParams();
  const { data, isLoading } = useAsync<{
    source: Tables<'sources'> | undefined;
    integration: Tables<'source_integrations'> | undefined;
  }>({
    initial: { source: undefined, integration: undefined },
    fetcher: async () => {
      const source = await getSource(params['slug'] as string);
      if (!source.ok) {
        throw 'Failed to fetch source. Please refresh.';
      }

      const integration = await getSourceIntegration(undefined, source.data.id);

      return {
        source: source.data,
        integration: integration.ok ? integration.data : undefined,
      };
    },
    deps: [],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col size-full justify-center items-center">
        <Spinner size={48} />
      </div>
    );
  }

  if (!data || !data.source) {
    return null;
  }

  const renderBody = () => {
    if (!data || !data.source) {
      return null;
    }
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosPartner source={data.source} integration={data.integration} />;
      case 'microsoft-365':
        return <Microsoft365 source={data.source} integration={data.integration} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 size-full">
      {/* Back button */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/integrations">Integrations</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{data.source.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Logo header */}
      <div className="flex flex-col size-full">
        <section
          className={`flex w-full h-40 items-center justify-center rounded-t-lg overflow-hidden shadow-md`}
          style={{ backgroundColor: data.source.color || '' }}
        >
          <Image
            width={2048}
            height={1080}
            src={data.source.logo_url || ''}
            alt={`${data.source.name} Logo`}
            className="w-1/3 h-fit max-h-14 object-contain"
          />
        </section>

        {/* Main content */}
        <Card className="rounded-t-none size-full">
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{data.source.name}</h1>
                <p className="text-muted-foreground">{data.source.description}</p>
              </div>

              {data.integration ? (
                <Badge className="text-base">Active</Badge>
              ) : (
                <Badge className="text-base" variant="destructive">
                  Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col size-full">{renderBody()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
