import {
  Card,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getClient, getSites } from "@/lib/actions/server/clients";
import SitesTable from "@/components/tables/SitesTable";

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
  const params = await props.params;
  const client = await getClient(params.id);
  const sites = await getSites(params.id);

  if (!client.ok || !sites.ok) {
    return (
      <Card>
        Failed to fetch data. Contact support.
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{client.data.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <SitesTable client={client.data} sites={sites.data} />
    </div>
  );
}