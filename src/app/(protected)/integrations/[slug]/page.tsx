'use server';

import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SourceBreadcrumb } from '@/components/domain/sources/SourceBreadcrumbs';
import Microsoft365Enabled from '@/components/domain/integrations/microsoft/Microsoft365Enabled';
import Microsoft365Disabled from '@/components/domain/integrations/microsoft/Microsoft365Disabled';
import SophosPartnerDisabled from '@/components/domain/integrations/sophos/SophosPartnerDisabled';
import SophosPartnerEnabled from '@/components/domain/integrations/sophos/SophosPartnerEnabled';
import AutotaskEnabled from '@/components/domain/integrations/autotask/AutotaskEnabled';
import AutotaskDisabled from '@/components/domain/integrations/autotask/AutotaskDisabled';
import ToggleIntegration from '@/components/domain/integrations/ToggleIntegration';
import { getRow } from '@/db/orm';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const sourceFetch = await getRow('public', 'sources', { filters: [['id', 'eq', params.slug]] });
  const integrationFetch = await getRow('public', 'integrations', {
    filters: [['source_id', 'eq', params.slug]],
  });
  if (sourceFetch.error) return <strong>Failed to find source. Please refresh.</strong>;
  const source = sourceFetch.data;
  const integration = !integrationFetch.error ? integrationFetch.data : undefined;

  const getBody = () => {
    switch (source.id) {
      case 'autotask':
        if (integration) return <AutotaskEnabled source={source} integration={integration} />;
        return <AutotaskDisabled source={source} />;
      case 'sophos-partner':
        if (integration) return <SophosPartnerEnabled source={source} integration={integration} />;
        return <SophosPartnerDisabled source={source} />;
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
          <div className="p-1 border bg-secondary size-fit rounded-md">
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
          <ToggleIntegration source={source} integration={integration} />
        </div>
      </div>

      {getBody()}
    </div>
  );
}
