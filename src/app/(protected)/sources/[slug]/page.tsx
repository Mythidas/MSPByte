import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SophosPartnerMappings from "@/components/mappings/SophosPartnerMappings";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import { getSource } from "@/lib/actions/server/sources";
import Microsoft365Mappings from "@/components/mappings/Microsoft365Mappings";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab: string, search: string }>;
}

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const source = await getSource(undefined, params.slug);

  if (!source.ok) {
    return <ErrorDisplay />
  }

  const getMappingComponent = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosPartnerMappings source={source.data} tab={searchParams.tab} search={searchParams.search} />
      case 'microsoft-365':
        return <Microsoft365Mappings source={source.data} tab={searchParams.tab} search={searchParams.search} />
    }
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/sources">Sources</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{source.data.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {getMappingComponent()}
    </>
  );
}