import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { getSource } from 'packages/services/sources';
import MicrosoftGlobalMapping from '@/components/domains/microsoft/mappings/MicrosoftGlobalMapping';
import SophosGlobalMapping from '@/components/domains/sophos/mappings/SophosGlobalMapping';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const source = await getSource(params.slug);

  if (!source.ok) {
    return <ErrorDisplay />;
  }

  const getMappingComponent = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosGlobalMapping sourceId={params.slug} tab={searchParams.tab} />;
      case 'microsoft-365':
        return <MicrosoftGlobalMapping sourceId={params.slug} tab={searchParams.tab} />;
    }
  };

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
