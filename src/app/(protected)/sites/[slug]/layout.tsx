'use server';

import SitesSidebar from '@/shared/components/layout/SitesSidebar';
import React from 'react';
import SiteBreadcrumbs from '@/features/sites/components/SiteBreadcrumbs';
import { getRow } from '@/db/orm';
import ErrorDisplay from '@/shared/components/ErrorDisplay';
import SiteProviderClient from '@/shared/lib/providers/SiteProvider';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function Layout({ children, ...props }: Props) {
  const params = await props.params;
  const site = await getRow('public', 'sites', {
    filters: [['slug', 'eq', params.slug]],
  });

  if (site.error) {
    return <ErrorDisplay message="Failed to find site" />;
  }

  return (
    <SitesSidebar site={site.data}>
      <SiteBreadcrumbs site={site.data} />
      <SiteProviderClient site={site.data}>{children}</SiteProviderClient>
    </SitesSidebar>
  );
}
