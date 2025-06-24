import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SophosPartner from '@/components/sources/SophosPartner';
import { Badge } from '@/components/ui/badge';
import { getSites } from 'packages/services/sites';
import { getSource } from 'packages/services/sources';
import { getSourceIntegration } from 'packages/services/integrations';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Microsoft365 from '@/components/sources/Microsoft365';
import Image from 'next/image';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab: string }>;
};

export default async function SourcePage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const source = await getSource(undefined, params.slug);

  if (!source.ok) {
    return (
      <Card>
        <CardHeader>Failed to fetch source</CardHeader>
      </Card>
    );
  }

  const integration = await getSourceIntegration(undefined, source.data.id);
  const sites = await getSites();

  if (!sites.ok) {
    return (
      <Card>
        <CardHeader>Failed to fetch data</CardHeader>
      </Card>
    );
  }

  const renderBody = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return (
          <SophosPartner
            source={source.data}
            integration={integration.ok ? integration.data : null}
            sites={sites.data}
            searchParams={searchParams}
          />
        );
      case 'microsoft-365':
        return (
          <Microsoft365
            source={source.data}
            integration={integration.ok ? integration.data : null}
            sites={sites.data}
            searchParams={searchParams}
          />
        );
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
          <BreadcrumbPage>{source.data.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Logo header */}
      <div className="flex flex-col size-full">
        <section
          className={`flex w-full h-40 items-center justify-center rounded-t-lg overflow-hidden shadow-md`}
          style={{ backgroundColor: source.data.color || '' }}
        >
          <Image
            src={source.data.logo_url || ''}
            alt={`${source.data.name} Logo`}
            className="w-1/3 h-fit max-h-14 object-contain"
          />
        </section>

        {/* Main content */}
        <Card className="rounded-t-none size-full">
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{source.data.name}</h1>
                <p className="text-muted-foreground">{source.data.description}</p>
              </div>

              {integration.ok ? (
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
