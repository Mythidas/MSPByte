import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SophosPartner from "@/components/sources/SophosPartner";
import { createSophostIntegrationAction, invalidIntegrationAction } from "@/lib/actions/form/sources";
import { Badge } from "@/components/ui/badge";
import { getSites } from "@/lib/actions/server/clients";
import { getSource } from "@/lib/actions/server/sources";
import { getSiteSourceMappings } from "@/lib/actions/server/sources/site-source-mappings";
import { getIntegration } from "@/lib/actions/server/integrations";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab: string }>;
}

export default async function SourcePage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const source = await getSource(undefined, params.slug);

  if (!source.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch source
        </CardHeader>
      </Card>
    )
  }

  const integration = await getIntegration(undefined, source.data.id);
  const mappings = await getSiteSourceMappings(source.data.id);
  const sites = await getSites();

  if (!integration.ok || !mappings.ok || !sites.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data
        </CardHeader>
      </Card>
    )
  }

  const renderBody = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosPartner
          source={source.data}
          integration={integration.data}
          mappings={mappings.data}
          sites={sites.data}
          searchParams={searchParams}
        />
      default: return null;
    }
  }

  function getSourceAction() {
    switch (params.slug) {
      case 'sophos-partner':
        return createSophostIntegrationAction
      default: return invalidIntegrationAction;
    }
  }

  return (
    <div className="flex flex-col size-full">
      {/* Back button */}
      <Link href="/integrations" className="flex items-center text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to integrations
      </Link>

      {/* Logo header */}
      <section className={`flex w-full h-40 items-center justify-center rounded-t-lg overflow-hidden`} style={{ backgroundColor: source.data.color || "" }}>
        <img src={source.data.logo_url || ""} alt={`${source.data.name} Logo`} className="w-1/3 h-fit max-h-24 object-contain" />
      </section>

      {/* Main content */}
      <Card className="rounded-t-none size-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{source.data.name}</h1>
              <p className="text-muted-foreground">{source.data.description}</p>
            </div>

            {integration ?
              <Badge className="text-base">Active</Badge> :
              <Badge className="text-base" variant="destructive">Inactive</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col size-full">
          {renderBody()}
        </CardContent>
      </Card>
    </div>
  );
}