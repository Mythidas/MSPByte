'use server';

import { Badge } from '@/components/ui/badge';
import { getSource } from 'packages/services/sources';
import Image from 'next/image';
import { Power } from 'lucide-react';
import { getSourceIntegration } from '@/services/integrations';
import { SourceBreadcrumb } from '@/components/source/sources/SourceBreadcrumbs';
import { Button } from '@/components/ui/button';
import SophosPartner from '@/components/source/integrations/sophos/SophosPartner';
import Microsoft365Enabled from '@/components/source/integrations/microsoft/Microsoft365Enabled';
import Microsoft365Disabled from '@/components/source/integrations/microsoft/Microsoft365Disabled';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const sourceFetch = await getSource(params.slug);
  const integrationFetch = await getSourceIntegration(undefined, params.slug);
  if (!sourceFetch.ok) return <strong>Failed to find source. Please refresh.</strong>;
  const source = sourceFetch.data;
  const integration = integrationFetch.ok ? integrationFetch.data : undefined;

  const getBody = () => {
    switch (source.id) {
      case 'sophos-partner':
        return <SophosPartner source={source} integration={integration} />;
      case 'microsoft-365':
        if (integration) return <Microsoft365Enabled source={source} integration={integration} />;
        return <Microsoft365Disabled source={source} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 size-full">
      {/* Back button */}
      <SourceBreadcrumb slug={params.slug} sourceName={source.name} />

      {/* Header */}
      <div className="flex w-full justify-between">
        <div className="flex gap-2">
          <div className="p-1 bg-white size-fit rounded-md">
            <Image src={source.icon_url || ''} alt={source.name} width={48} height={48} />
          </div>
          <div className="flex flex-col justify-between">
            <h1 className="font-bold text-2xl">{source.name}</h1>
            <span className="text-sm text-muted-foreground">{source.description}</span>
          </div>
        </div>
        <div className="flex h-8">
          <Badge className="text-base space-x-1 rounded-r-none" variant="secondary">
            {integration ? (
              <>
                <div className=" rounded-full w-2 h-2 bg-green-500" />
                <span>Enabled</span>
              </>
            ) : (
              <>
                <div className=" rounded-full w-2 h-2 bg-red-500" />
                <span>Disabled</span>
              </>
            )}
          </Badge>
          <Button
            variant={!integration ? 'default' : 'destructive'}
            className="rounded-l-none py-1! h-full!"
          >
            <Power />
          </Button>
        </div>
      </div>

      {getBody()}
    </div>
  );
}
