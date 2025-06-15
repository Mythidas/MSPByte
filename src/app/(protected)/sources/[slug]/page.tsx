import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SophosPartnerMapping from "@/components/mappings/SophosPartnerMapping";
import { getSite } from "@/lib/actions/server/sites";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import { getSource } from "@/lib/actions/server/sources";

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
        return <SophosPartnerMapping source={source.data} tab={searchParams.tab} search={searchParams.search} />
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