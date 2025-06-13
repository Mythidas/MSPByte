import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getClient, getSite } from "@/lib/actions/server/clients";
import RouteCard from "@/components/ux/RouteCard";
import { getSiteSourceMappings } from "@/lib/actions/server/sources/site-source-mappings";
import { getSources } from "@/lib/actions/server/sources";

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
  const params = await props.params;
  const site = await getSite(params.id);
  const sources = await getSources();

  if (!site.ok || !sources.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data. Contact support.
        </CardHeader>
      </Card>
    )
  }

  const client = await getClient(site.data.client_id || "");
  const mappings = await getSiteSourceMappings(undefined, site.data.id);

  if (!client.ok || !mappings.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data. Contact support.
        </CardHeader>
      </Card>
    )
  }

  if (mappings.data.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={`/clients/${client.data.id}`}>{client.data.name}</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            No Site Mappings.
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/clients/${client.data.id}`}>{client.data.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {mappings.data.map((mapping) => {
          const source = sources.data.find((s) => s.id === mapping.source_id);

          return (
            <RouteCard
              key={mapping.id}
              className="justify-center items-center"
              route={`/clients/mapping/${mapping.id}`}
              module="clients"
              level="read"
            >
              {source?.name}
            </RouteCard>
          )
        })}
      </div>
    </div>
  );
}