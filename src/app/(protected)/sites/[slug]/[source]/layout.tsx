import IntegrationHeader from '@/components/domain/integrations/IntegrationHeader';
import { getRow } from '@/db/orm';

type Props = {
  params: Promise<{ slug: string; source: string }>;
  children: React.ReactNode;
};

export default async function Layout({ params, children }: Props) {
  const { slug, source } = await params;
  const site = await getRow('public', 'sites', {
    filters: [['slug', 'eq', slug]],
  });

  if (site.error) {
    return <strong>No site found. Please refresh.</strong>;
  }

  const tenant = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', source],
      ['site_id', 'eq', site.data.id],
    ],
  });

  return (
    <div className="flex flex-col size-full gap-4">
      <IntegrationHeader
        sourceId={source as string}
        siteId={site.data.id}
        tenantId={site.data.tenant_id}
        hide={!!tenant.error}
      />
      {tenant.error ? (
        <strong>This site does not have a Tenant mapping for this source</strong>
      ) : (
        children
      )}
    </div>
  );
}
