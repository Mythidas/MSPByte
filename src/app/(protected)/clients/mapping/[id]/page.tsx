import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SophosPartnerMapping from "@/components/mappings/SophosPartnerMapping";
import { getSiteMapping } from "@/lib/actions/server/sources/site-source-mappings";

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page(props: Props) {
  const params = await props.params;
  const mapping = await getSiteMapping(params.id);

  if (!mapping.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data. Contact support.
        </CardHeader>
      </Card>
    )
  }

  const getMappingComponent = () => {
    switch (mapping.data.source_slug) {
      case 'sophos-partner':
        return <SophosPartnerMapping mapping={mapping.data} />
    }
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/clients/${mapping.data.client_id}`}>{mapping.data.client_name}</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/clients/site/${mapping.data.site_id}`}>{mapping.data.site_name}</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{mapping.data.source_name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {getMappingComponent()}
    </>
  );
}